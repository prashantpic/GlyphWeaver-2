locals {
  environment_name = "dev"
  common_tags      = merge(var.default_tags, {
    Environment = local.environment_name
    Project     = var.project_name
  })

  # Construct IP access list for MongoDB Atlas
  # This might include VPC endpoints, NAT gateway IPs, or specific developer IPs for dev
  mongodb_ip_access_list_cidrs = [
    {
      cidr_block = var.dev_allowed_ip_for_db_access
      comment    = "Allow access from specified dev IP/CIDR"
    },
    # If services in private subnets need to access Atlas and use NAT Gateway
    # for egress, NAT Gateway EIPs should be added here.
    # This example assumes NAT gateway IPs are discovered and added if dev_enable_nat_gateway is true.
    # More robustly, one might output NAT EIPs from networking module and use them here.
    # For simplicity in this example, we keep it to a single configurable IP.
  ]
}

# REQ-8-008 (Networking for scalable services), REQ-8-025 (DR - Multi-AZ subnets)
module "networking_dev" {
  source = "../../modules/networking"

  vpc_cidr_block     = var.dev_vpc_cidr_block
  public_subnet_cidrs  = var.dev_public_subnet_cidrs
  private_subnet_cidrs = var.dev_private_subnet_cidrs
  availability_zones   = var.dev_availability_zones
  enable_nat_gateway   = var.dev_enable_nat_gateway
  single_nat_gateway   = var.dev_single_nat_gateway

  tags = local.common_tags
}

# IAM Roles and Policies
# REQ-8-008 (IAM for services)
module "iam_dev_ecs_execution_role" {
  source = "../../modules/iam"

  role_name_prefix = "${var.project_name}-ecs-execution-role-${local.environment_name}"
  assume_role_policy_json = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
  ]
  tags = local.common_tags
}

module "iam_dev_ecs_task_role" {
  source = "../../modules/iam"

  role_name_prefix = "${var.project_name}-ecs-task-role-${local.environment_name}"
  assume_role_policy_json = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
  # Attach policies/iam_backend_service_policy.json conceptually here
  # For simplicity, can allow access to specific services or use managed policies.
  # Example: allow S3, SQS, CloudWatch Logs access.
  inline_policies = {
    "BackendServicePolicy" = file("../../policies/iam_backend_service_policy.json") # Assuming this policy exists and is parameterized appropriately or generic enough
  }
  tags = local.common_tags
}

# Security Groups and KMS
# REQ-8-008 (Security groups), REQ-8-024 (KMS for encrypted backups), REQ-8-025 (KMS for DR)
module "security_dev" {
  source = "../../modules/security"

  vpc_id                      = module.networking_dev.vpc_id
  security_group_name_prefix  = "${var.project_name}-${local.environment_name}"
  kms_key_alias_name          = "alias/${var.project_name}-kms-key-${local.environment_name}"
  enable_waf                  = false # WAF typically not enabled for dev to save costs
  environment                 = local.environment_name
  project_name                = var.project_name

  # Example ingress/egress rules (can be more specific)
  app_ingress_rules = [
    {
      description = "Allow HTTP from anywhere (for ALB)"
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    },
    {
      description = "Allow HTTPS from anywhere (for ALB)"
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]
  cache_ingress_rules = [
    {
      description = "Allow Redis traffic from App SG"
      from_port   = 6379 # Default Redis port
      to_port     = 6379
      protocol    = "tcp"
      # Source will be app_security_group_id, handled inside module if designed so, or pass explicitly
      # For this example, we'll assume the module handles internal SG references or we pass an SG ID.
      # This example implies module will create a cache SG and needs app SG ID to allow traffic.
      # Here, we pass a placeholder, actual wiring would be: source_security_group_id = module.security_dev.app_security_group_id (if app_sg is created first)
      # Or, define all SGs here and pass their IDs to modules. Let's assume security module creates them based on prefixes.
    }
  ]
  tags = local.common_tags
}

# ECS Cluster and Service
# REQ-8-008 (Deploy backend services using auto-scaling), REQ-8-025 (DR - Multi-AZ service placement)
module "compute_ecs_dev" {
  source = "../../modules/compute_ecs"

  app_name                      = "${var.project_name}-app-${local.environment_name}"
  environment                   = local.environment_name
  app_image_url                 = var.dev_app_image_url
  app_port                      = var.dev_app_port
  container_cpu                 = var.dev_container_cpu
  container_memory              = var.dev_container_memory
  desired_count                 = var.instance_count_dev
  min_capacity                  = var.dev_ecs_min_capacity
  max_capacity                  = var.dev_ecs_max_capacity
  ecs_task_execution_role_arn   = module.iam_dev_ecs_execution_role.iam_role_arn
  ecs_task_role_arn             = module.iam_dev_ecs_task_role.iam_role_arn
  vpc_id                        = module.networking_dev.vpc_id
  subnet_ids                    = module.networking_dev.private_subnet_ids # Deploy services in private subnets
  load_balancer_subnet_ids      = module.networking_dev.public_subnet_ids  # ALB in public subnets
  app_security_group_ids        = [module.security_dev.app_security_group_id]
  load_balancer_security_group_ids = [module.security_dev.lb_security_group_id] # Assuming security module creates an LB SG

  health_check_path = "/health" # Example health check path

  enable_detailed_logging = var.enable_detailed_logging_dev

  tags = local.common_tags
}

# MongoDB Atlas Database
# REQ-8-024 (Automated daily database backups), REQ-8-025 (DR - Replication, backup/restore)
module "database_mongodb_atlas_dev" {
  source = "../../modules/database_mongodb_atlas"

  atlas_org_id          = var.atlas_org_id_dev
  atlas_project_name    = "${var.project_name}-${local.environment_name}"
  cluster_name          = "${var.project_name}-cluster-${local.environment_name}"
  cluster_tier          = var.db_tier_dev
  provider_region_name  = var.dev_atlas_provider_region_name
  backup_enabled        = true # REQ-8-024
  db_username           = var.dev_db_username
  db_password           = var.dev_db_password
  ip_access_list_cidrs  = local.mongodb_ip_access_list_cidrs
  replication_factor    = 3 # Default for M0 is 3, good for dev. REQ-8-025 aspect
  environment           = local.environment_name
  project_name          = var.project_name

  # For backup policy, assume module has defaults or accepts detailed config
  # backup_policy = jsondecode(file("../../policies/mongodb_atlas_backup_policy.json")) # conceptually
  
  tags = local.common_tags
}

# ElastiCache for Redis
# REQ-8-008 (Dependency for scalable backend - backend-cache-provider)
module "caching_redis_dev" {
  source = "../../modules/caching_redis"

  cluster_name         = "${var.project_name}-redis-${local.environment_name}"
  environment          = local.environment_name
  project_name         = var.project_name
  cache_node_type      = var.dev_cache_node_type
  cache_engine_version = var.dev_cache_engine_version
  vpc_id               = module.networking_dev.vpc_id
  subnet_ids           = module.networking_dev.private_subnet_ids # Deploy cache in private subnets
  security_group_ids   = [module.security_dev.cache_security_group_id]
  # cluster_mode_enabled can be false for dev

  tags = local.common_tags
}

# API Gateway (IAP Gateway)
# REQ-8-008 (API endpoint - backend-platform-iap-validator-gateway)
module "iap_gateway_dev" {
  source = "../../modules/iap_gateway"

  api_name          = "${var.project_name}-iap-gw-${local.environment_name}"
  environment       = local.environment_name
  project_name      = var.project_name
  integration_type  = "HTTP_PROXY" # Assuming integration with ALB of ECS
  integration_uri   = module.compute_ecs_dev.app_load_balancer_listener_arn # This needs to be the listener ARN or LB DNS for HTTP integration
                                                                            # Or specific integration type like VPC_LINK
  # For direct integration with ALB:
  # integration_uri = "http://${module.compute_ecs_dev.app_load_balancer_dns_name}" # if ALB is public
  # If ALB is internal, requires a VPCLink. For simplicity with HTTP_PROXY, assume it's accessible.
  # A more common ECS integration might use AWS_PROXY with Lambda or direct to ALB via private integration.
  # Let's use the ALB DNS name for HTTP_PROXY.
  http_integration_uri = "http://${module.compute_ecs_dev.app_load_balancer_dns_name}" # Requires ALB to be internet-facing or use VPC Link

  # custom_domain_name = "api.dev.${var.global_domain_name}" # Requires Route53 and ACM certs from shared module
  # certificate_arn    = module.shared_resources.dev_api_certificate_arn # Example

  tags = local.common_tags
}