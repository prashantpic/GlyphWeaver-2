# --- modules/compute_ecs/main.tf ---
# Purpose: Provisions AWS ECS cluster, task definitions, services with load balancing (ALB),
# and auto-scaling groups. Supports deployment of containerized backend services (REQ-8-008)
# and contributes to DR via multi-AZ service placement (REQ-8-025).

locals {
  tags = merge(var.tags, {
    Terraform   = "true"
    Project     = var.project_name
    Environment = var.environment
    Module      = "compute-ecs"
    Service     = var.app_name
  })
}

resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-ecs-cluster-${var.app_name}-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = local.tags
}

resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/ecs/${var.project_name}/${var.app_name}-${var.environment}"
  retention_in_days = var.log_retention_days

  tags = merge(local.tags, {
    Name = "${var.project_name}-${var.app_name}-logs-${var.environment}"
  })
}

resource "aws_ecs_task_definition" "app_task" {
  family                   = "${var.project_name}-${var.app_name}-task-${var.environment}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.container_cpu
  memory                   = var.container_memory
  execution_role_arn       = var.ecs_task_execution_role_arn
  task_role_arn            = var.ecs_task_role_arn # Optional role for application-specific permissions

  container_definitions = jsonencode([
    {
      name      = var.app_name
      image     = var.app_image_url
      cpu       = var.container_cpu
      memory    = var.container_memory
      essential = true
      portMappings = [
        {
          containerPort = var.app_port
          hostPort      = var.app_port # Not strictly necessary for Fargate awsvpc, but good practice
          protocol      = "tcp"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.app_logs.name
          "awslogs-region"        = var.aws_region # Ensure region is available to the module
          "awslogs-stream-prefix" = "ecs"
        }
      }
      environment = var.container_environment_variables
      secrets     = var.container_secrets # REQ-SEC-002: Secrets for containers
    }
  ])

  tags = local.tags
}

resource "aws_lb" "app_lb" {
  name               = "${var.project_name}-${var.app_name}-alb-${var.environment}"
  internal           = var.alb_internal
  load_balancer_type = "application"
  security_groups    = var.alb_security_group_ids
  subnets            = var.subnet_ids # Typically public subnets for external LB, private for internal

  enable_deletion_protection = var.environment == "prod" ? true : false # REQ-8-025: Protect prod resources

  tags = local.tags
}

resource "aws_lb_target_group" "app_tg" {
  name        = "${var.project_name}-${var.app_name}-tg-${var.environment}"
  port        = var.app_port
  protocol    = "HTTP" # ALB talks HTTP to targets, even if listener is HTTPS
  vpc_id      = var.vpc_id
  target_type = "ip"  # For Fargate

  health_check {
    enabled             = true
    path                = var.health_check_path
    protocol            = "HTTP"
    matcher             = "200-299"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
  }

  tags = local.tags
}

resource "aws_lb_listener" "http" {
  count             = var.enable_http_listener ? 1 : 0
  load_balancer_arn = aws_lb.app_lb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }

  # Optional: Redirect HTTP to HTTPS
  # default_action {
  #   type = "redirect"
  #   redirect {
  #     port        = "443"
  #     protocol    = "HTTPS"
  #     status_code = "HTTP_301"
  #   }
  # }
}

resource "aws_lb_listener" "https" {
  count             = var.enable_https_listener ? 1 : 0
  load_balancer_arn = aws_lb.app_lb.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08" # Choose an appropriate policy
  certificate_arn   = var.alb_certificate_arn     # Required if HTTPS is enabled

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }
}

resource "aws_ecs_service" "app_service" {
  name            = "${var.project_name}-${var.app_name}-service-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app_task.arn
  desired_count   = var.desired_count # REQ-8-008: Auto Scaling initial count
  launch_type     = "FARGATE"

  # REQ-8-025: Multi-AZ for services for DR
  network_configuration {
    subnets          = var.service_subnet_ids # Typically private subnets for Fargate tasks
    security_groups  = var.service_security_group_ids
    assign_public_ip = var.service_assign_public_ip # Typically false for Fargate tasks behind ALB
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app_tg.arn
    container_name   = var.app_name
    container_port   = var.app_port
  }

  # Ensures new task definition is deployed when changed
  force_new_deployment = true

  # Optional: Service discovery
  # service_registries {
  #   registry_arn = aws_service_discovery_service.example.arn
  # }

  lifecycle {
    ignore_changes = [desired_count] # Auto Scaling will manage this
  }

  depends_on = [
    aws_lb_listener.http,
    aws_lb_listener.https,
    var.ecs_task_execution_role_arn, # Ensure role exists
    var.ecs_task_role_arn != null ? var.ecs_task_role_arn : null
  ]

  tags = local.tags
}

# REQ-8-008: Auto Scaling for backend services
resource "aws_appautoscaling_target" "ecs_target" {
  count              = var.enable_autoscaling ? 1 : 0
  max_capacity       = var.max_capacity
  min_capacity       = var.min_capacity
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.app_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"

  depends_on = [aws_ecs_service.app_service]
}

# CPU-based Scaling Policy
resource "aws_appautoscaling_policy" "ecs_cpu_scaling" {
  count              = var.enable_autoscaling && var.cpu_scaling_threshold > 0 ? 1 : 0
  name               = "${var.app_name}-cpu-scaling-${var.environment}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target[0].resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = var.cpu_scaling_threshold
    scale_in_cooldown  = var.scale_in_cooldown
    scale_out_cooldown = var.scale_out_cooldown
  }
  depends_on = [aws_appautoscaling_target.ecs_target[0]]
}

# Memory-based Scaling Policy
resource "aws_appautoscaling_policy" "ecs_memory_scaling" {
  count              = var.enable_autoscaling && var.memory_scaling_threshold > 0 ? 1 : 0
  name               = "${var.app_name}-memory-scaling-${var.environment}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target[0].resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value       = var.memory_scaling_threshold
    scale_in_cooldown  = var.scale_in_cooldown
    scale_out_cooldown = var.scale_out_cooldown
  }
  depends_on = [aws_appautoscaling_target.ecs_target[0]]
}

# Request Count-based Scaling Policy (if ALB is used)
resource "aws_appautoscaling_policy" "ecs_alb_request_scaling" {
  count              = var.enable_autoscaling && var.alb_request_count_per_target > 0 ? 1 : 0
  name               = "${var.app_name}-alb-requests-scaling-${var.environment}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target[0].resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ALBRequestCountPerTarget"
      resource_label         = "${aws_lb.app_lb.arn_suffix}/${aws_lb_target_group.app_tg.arn_suffix}"
    }
    target_value       = var.alb_request_count_per_target
    scale_in_cooldown  = var.scale_in_cooldown
    scale_out_cooldown = var.scale_out_cooldown
  }
  depends_on = [aws_appautoscaling_target.ecs_target[0]]
}