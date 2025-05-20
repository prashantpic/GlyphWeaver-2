locals {
  environment_name = "prod"
  common_tags      = merge(var.default_tags, {
    Environment = local.environment_name
    Project     = var.project_name
  })

  # For production, IP access list should be very strict, primarily NAT Gateway EIPs
  # These EIPs should be outputs from the networking module if not using `single_nat_gateway`.
  # If using single_nat_gateway, it's one EIP. If multiple NATs, it's a list.
  # This example assumes these IPs are gathered (e.g. from var.prod_allowed_ips_for_db_access).
  mongodb_ip_access_list_cidrs = [
    for cidr in var.prod_allowed_ips_for_db_access : {
      cidr_block = cidr
      comment    = "Allow access from Prod NAT Gateway or Bastion"
    }
  ]
}

# REQ-8-008 (Networking for scalable services), REQ-8-025 (DR - Multi-AZ subnets)
module "networking_prod" {
  source = "../../modules/networking"

  vpc_cidr_block     = var.prod_vpc_cidr_block
  public_subnet_cidrs  = var.prod_public_subnet_cidrs  # Expecting multiple for multi-AZ
  private_subnet_cidrs = var.prod_private_subnet_cidrs # Expecting multiple for multi-AZ
  availability_zones   = var.prod_availability_zones   # Must match subnet count per type
  enable_nat_gateway   = var.prod_enable_nat_gateway
  single_nat_gateway   = var.prod_single_nat_gateway   # False for HA NATs (one per AZ)

  tags = local.common_tags
}

# IAM Roles and Policies
# REQ-8-008 (IAM for services)
module "iam_prod_ecs_execution_role" {
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

module "iam_prod_ecs_task_role" {
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

# Security Groups, KMS, and WAF
# REQ-8-008 (Security groups, WAF), REQ-8-024 (KMS for encrypted backups), REQ-8-025 (KMS for DR)
module "security_prod" {
  source = "../../modules/security"

  vpc_id                      = module.networking_prod.vpc_id
  security_group_name_prefix  = "${var.project_name}-${local.environment_name}"
  kms_key_alias_name          = "alias/${var.project_name}-kms-key-${local.environment_name}"
  enable_waf                  = var.prod_enable_waf_protection
  waf_web_acl_name            = var.prod_waf_web_acl_name
  environment                 = local.environment_name
  project_name                = var.project_name

  app_ingress_rules = [
    {
      description = "Allow HTTP from anywhere (for ALB, WAF will inspect)"
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    },
    {
      description = "Allow HTTPS from anywhere (for ALB, WAF will inspect)"
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]
  # cache_ingress_rules would be defined here if needed, allowing traffic from app_security_group_id on Redis port.
  tags = local.common_tags
}

# ECS Cluster and Service
# REQ-8-008 (Deploy backend services using auto-scaling), REQ-8-025 (DR - Multi-AZ service placement)
module "compute_ecs_prod" {
  source = "../../modules/compute_ecs"

  app_name                      = "${var.project_name}-app-${local.environment_name}"
  environment                   = local.environment_name
  app_image_url                 = var.prod_app_image_url
  app_port                      = var.prod_app_port
  container_cpu                 = var.prod_container_cpu
  container_memory              = var.prod_container_memory
  desired_count                 = var.instance_count_prod
  min_capacity                  = var.prod_ecs_min_capacity
  max_capacity                  = var.prod_ecs_max_capacity
  ecs_task_execution_role_arn   = module.iam_prod_ecs_execution_role.iam_role_arn
  ecs_task_role_arn             = module.iam_prod_ecs_task_role.iam_role_arn
  vpc_id                        = module.networking_prod.vpc_id
  subnet_ids                    = module.networking_prod.private_subnet_ids # Multi-AZ for prod
  load_balancer_subnet_ids      = module.networking_prod.public_subnet_ids  # Multi-AZ for prod
  app_security_group_ids        = [module.security_prod.app_security_group_id]
  load_balancer_security_group_ids = [module.security_prod.lb_security_group_id]
  health_check_path             = "/health"
  enable_detailed_logging       = true # Prod should have detailed logging to CloudWatch

  # Associate WAF with ALB if enabled
  enable_waf        = var.prod_enable_waf_protection
  waf_web_acl_arn   = var.prod_enable_waf_protection ? module.security_prod.waf_web_acl_arn : null

  tags = local.common_tags
}

# MongoDB Atlas Database
# REQ-8-024 (Automated daily database backups with retention), REQ-8-025 (DR - Replication, Sharding, backup/restore)
module "database_mongodb_atlas_prod" {
  source = "../../modules/database_mongodb_atlas"

  atlas_org_id          = var.atlas_org_id_prod
  atlas_project_name    = "${var.project_name}-${local.environment_name}"
  cluster_name          = "${var.project_name}-cluster-${local.environment_name}"
  cluster_tier          = var.db_tier_prod
  provider_region_name  = var.prod_atlas_provider_region_name
  backup_enabled        = true # REQ-8-024
  # The module should use var.db_backup_retention_prod conceptually for backup policy
  # Example: backup_retention_days = var.db_backup_retention_prod (if module supports this directly)
  db_username           = var.prod_db_username
  db_password           = var.prod_db_password
  ip_access_list_cidrs  = local.mongodb_ip_access_list_cidrs
  num_shards            = var.prod_atlas_num_shards # REQ-8-025 (Scalability/DR aspect)
  replication_factor    = var.prod_atlas_replication_factor # REQ-8-025 (HA/DR aspect)
  environment           = local.environment_name
  project_name          = var.project_name

  # For actual retention: module needs to construct the policy for mongodbatlas_cloud_backup_schedule
  # This might involve setting export buckets, frequencies, and retention values in the policy block.
  # The `db_backup_retention_prod` acts as an input to this logic within the module.

  tags = local.common_tags
}

# ElastiCache for Redis
# REQ-8-008 (Dependency for scalable backend - backend-cache-provider), REQ-8-025 (DR/HA - Cluster mode, Multi-AZ)
module "caching_redis_prod" {
  source = "../../modules/caching_redis"

  cluster_name                 = "${var.project_name}-redis-${local.environment_name}"
  environment                  = local.environment_name
  project_name                 = var.project_name
  cache_node_type              = var.prod_cache_node_type
  cache_engine_version         = var.prod_cache_engine_version
  vpc_id                       = module.networking_prod.vpc_id
  subnet_ids                   = module.networking_prod.private_subnet_ids # Multi-AZ for prod if enable_multi_az_prod is true for underlying network
  security_group_ids           = [module.security_prod.cache_security_group_id]
  cluster_mode_enabled         = var.prod_redis_cluster_mode_enabled
  num_node_groups              = var.prod_redis_cluster_mode_enabled ? var.prod_redis_num_node_groups : null
  replicas_per_node_group      = var.prod_redis_cluster_mode_enabled ? var.prod_redis_replicas_per_node_group : null
  # automatic_failover_enabled = var.enable_multi_az_prod # implied by cluster mode or replication group settings

  tags = local.common_tags
}

# API Gateway (IAP Gateway)
# REQ-8-008 (API endpoint - backend-platform-iap-validator-gateway)
module "iap_gateway_prod" {
  source = "../../modules/iap_gateway"

  api_name          = "${var.project_name}-iap-gw-${local.environment_name}"
  environment       = local.environment_name
  project_name      = var.project_name
  integration_type  = "HTTP_PROXY"
  http_integration_uri = "http://${module.compute_ecs_prod.app_load_balancer_dns_name}" # Or HTTPS if ALB listener is 443
  
  custom_domain_name = var.prod_custom_domain_name != "" ? var.prod_custom_domain_name : null
  certificate_arn    = var.prod_custom_domain_name != "" ? var.prod_certificate_arn : null
  # Route53 records for custom domain would be managed in `shared` module or separately.

  # Associate WAF with API Gateway if enabled (WAF module handles association or this module does)
  # The aws_wafv2_web_acl_association resource would target API Gateway stage ARN.
  enable_waf        = var.prod_enable_waf_protection # If API Gateway is public and needs WAF
  waf_web_acl_arn   = var.prod_enable_waf_protection ? module.security_prod.waf_web_acl_arn : null # WAF on API Gateway is another association

  tags = local.common_tags
}