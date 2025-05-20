locals {
  environment_name = "staging"
  common_tags      = merge(var.default_tags, {
    Environment = local.environment_name
    Project     = var.project_name
  })

  mongodb_ip_access_list_cidrs = [
    for cidr in var.staging_allowed_ips_for_db_access : {
      cidr_block = cidr
      comment    = "Allow access from specified staging IP/CIDR"
    }
    # Potentially add NAT Gateway EIPs if needed and deterministic
  ]
}

# REQ-8-008 (Networking for scalable services), REQ-8-025 (DR - Multi-AZ subnets)
module "networking_staging" {
  source = "../../modules/networking"

  vpc_cidr_block     = var.staging_vpc_cidr_block
  public_subnet_cidrs  = var.staging_public_subnet_cidrs
  private_subnet_cidrs = var.staging_private_subnet_cidrs
  availability_zones   = var.staging_availability_zones
  enable_nat_gateway   = var.staging_enable_nat_gateway
  single_nat_gateway   = var.staging_single_nat_gateway

  tags = local.common_tags
}

# IAM Roles and Policies
# REQ-8-008 (IAM for services)
module "iam_staging_ecs_execution_role" {
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

module "iam_staging_ecs_task_role" {
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
  inline_policies = {
    "BackendServicePolicy" = file("../../policies/iam_backend_service_policy.json")
  }
  tags = local.common_tags
}

# Security Groups and KMS
# REQ-8-008 (Security groups), REQ-8-024 (KMS for encrypted backups), REQ-8-025 (KMS for DR)
module "security_staging" {
  source = "../../modules/security"

  vpc_id                      = module.networking_staging.vpc_id
  security_group_name_prefix  = "${var.project_name}-${local.environment_name}"
  kms_key_alias_name          = "alias/${var.project_name}-kms-key-${local.environment_name}"
  enable_waf                  = false # WAF might be tested in staging, but often reserved for prod.
  environment                 = local.environment_name
  project_name                = var.project_name
  
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
  tags = local.common_tags
}

# ECS Cluster and Service
# REQ-8-008 (Deploy backend services using auto-scaling), REQ-8-025 (DR - Multi-AZ service placement)
module "compute_ecs_staging" {
  source = "../../modules/compute_ecs"

  app_name                      = "${var.project_name}-app-${local.environment_name}"
  environment                   = local.environment_name
  app_image_url                 = var.staging_app_image_url
  app_port                      = var.staging_app_port
  container_cpu                 = var.staging_container_cpu
  container_memory              = var.staging_container_memory
  desired_count                 = var.instance_count_staging
  min_capacity                  = var.staging_ecs_min_capacity
  max_capacity                  = var.staging_ecs_max_capacity
  ecs_task_execution_role_arn   = module.iam_staging_ecs_execution_role.iam_role_arn
  ecs_task_role_arn             = module.iam_staging_ecs_task_role.iam_role_arn
  vpc_id                        = module.networking_staging.vpc_id
  subnet_ids                    = module.networking_staging.private_subnet_ids
  load_balancer_subnet_ids      = module.networking_staging.public_subnet_ids
  app_security_group_ids        = [module.security_staging.app_security_group_id]
  load_balancer_security_group_ids = [module.security_staging.lb_security_group_id]
  health_check_path             = "/health"
  enable_detailed_logging       = true # Typically enabled for staging

  tags = local.common_tags
}

# MongoDB Atlas Database
# REQ-8-024 (Automated daily database backups), REQ-8-025 (DR - Replication, backup/restore)
module "database_mongodb_atlas_staging" {
  source = "../../modules/database_mongodb_atlas"

  atlas_org_id          = var.atlas_org_id_staging
  atlas_project_name    = "${var.project_name}-${local.environment_name}"
  cluster_name          = "${var.project_name}-cluster-${local.environment_name}"
  cluster_tier          = var.db_tier_staging
  provider_region_name  = var.staging_atlas_provider_region_name
  backup_enabled        = true # REQ-8-024
  # The module should interpret db_backup_retention_staging to configure Atlas backup policy
  # This implies the module needs a variable like `backup_retention_days`
  # For mongodbatlas_cloud_backup_schedule, retention is part of the policy block.
  # This might require passing a structured backup_policy or the module constructs it.
  # conceptual_backup_retention_days = var.db_backup_retention_staging
  db_username           = var.staging_db_username
  db_password           = var.staging_db_password
  ip_access_list_cidrs  = local.mongodb_ip_access_list_cidrs
  replication_factor    = 3 # REQ-8-025 aspect
  environment           = local.environment_name
  project_name          = var.project_name

  # Pass structured policy if module supports it, otherwise module uses its own logic for retention
  # backup_policy = var.staging_db_backup_policy 

  tags = local.common_tags
}

# ElastiCache for Redis
# REQ-8-008 (Dependency for scalable backend - backend-cache-provider)
module "caching_redis_staging" {
  source = "../../modules/caching_redis"

  cluster_name         = "${var.project_name}-redis-${local.environment_name}"
  environment          = local.environment_name
  project_name         = var.project_name
  cache_node_type      = var.staging_cache_node_type
  cache_engine_version = var.staging_cache_engine_version
  vpc_id               = module.networking_staging.vpc_id
  subnet_ids           = module.networking_staging.private_subnet_ids
  security_group_ids   = [module.security_staging.cache_security_group_id]
  cluster_mode_enabled = false # Staging might not need cluster mode yet, depends on requirements

  tags = local.common_tags
}

# API Gateway (IAP Gateway)
# REQ-8-008 (API endpoint - backend-platform-iap-validator-gateway)
module "iap_gateway_staging" {
  source = "../../modules/iap_gateway"

  api_name          = "${var.project_name}-iap-gw-${local.environment_name}"
  environment       = local.environment_name
  project_name      = var.project_name
  integration_type  = "HTTP_PROXY"
  http_integration_uri = "http://${module.compute_ecs_staging.app_load_balancer_dns_name}"

  tags = local.common_tags
}