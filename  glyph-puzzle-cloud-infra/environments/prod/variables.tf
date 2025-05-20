variable "instance_count_prod" {
  description = "Number of instances for services in production."
  type        = number
  default     = 3 # Higher default for prod
}

variable "db_backup_retention_prod" {
  description = "Backup retention period in days for production database (conceptual, actual retention is set in Atlas module config)."
  type        = number
  default     = 30 # Longer retention for prod
}

variable "enable_multi_az_prod" {
  description = "Flag to enable Multi-AZ deployments for production services (networking, ECS, Redis)."
  type        = bool
  default     = true
}

variable "db_tier_prod" {
  description = "MongoDB Atlas cluster tier for production (e.g., M30, M40)."
  type        = string
  default     = "M30" # Production grade tier
}

variable "atlas_org_id_prod" {
  description = "MongoDB Atlas Organization ID for the production environment."
  type        = string
  # No default, should be provided
}

variable "prod_vpc_cidr_block" {
  description = "CIDR block for the VPC in the production environment."
  type        = string
  default     = "10.2.0.0/16"
}

variable "prod_public_subnet_cidrs" {
  description = "List of CIDR blocks for public subnets in the production environment. Should span multiple AZs if enable_multi_az_prod is true."
  type        = list(string)
  default     = ["10.2.1.0/24", "10.2.2.0/24", "10.2.3.0/24"] # Example for 3 AZs
}

variable "prod_private_subnet_cidrs" {
  description = "List of CIDR blocks for private subnets in the production environment. Should span multiple AZs if enable_multi_az_prod is true."
  type        = list(string)
  default     = ["10.2.101.0/24", "10.2.102.0/24", "10.2.103.0/24"] # Example for 3 AZs
}

variable "prod_availability_zones" {
  description = "List of Availability Zones for the production environment. Must match the number of subnets if enable_multi_az_prod is true."
  type        = list(string)
  # Example: default = ["us-east-1a", "us-east-1b", "us-east-1c"]
  # No default to force explicit setting based on region and enable_multi_az_prod.
}

variable "prod_app_image_url" {
  description = "Docker image URL for the application in production."
  type        = string
  # No default, should be set to a specific, tested build artifact for production
}

variable "prod_app_port" {
  description = "Port the application container listens on in production."
  type        = number
  default     = 80
}

variable "prod_container_cpu" {
  description = "CPU units for the ECS task in production."
  type        = number
  default     = 1024 # Fargate: 1 vCPU
}

variable "prod_container_memory" {
  description = "Memory in MiB for the ECS task in production."
  type        = number
  default     = 2048 # Fargate: 2GB
}

variable "prod_ecs_min_capacity" {
  description = "Minimum number of ECS tasks for auto-scaling in production."
  type        = number
  default     = 3
}

variable "prod_ecs_max_capacity" {
  description = "Maximum number of ECS tasks for auto-scaling in production."
  type        = number
  default     = 10
}

variable "prod_db_username" {
  description = "Database username for MongoDB Atlas in production."
  type        = string
  # No default, should be unique and secure for prod
}

variable "prod_db_password" {
  description = "Database password for MongoDB Atlas in production."
  type        = string
  sensitive   = true
  # No default, should be provided via secure mechanism
}

variable "prod_cache_node_type" {
  description = "ElastiCache Redis node type for production."
  type        = string
  default     = "cache.m6g.large" # General purpose, memory optimized
}

variable "prod_cache_engine_version" {
  description = "ElastiCache Redis engine version for production."
  type        = string
  default     = "7.0"
}

variable "prod_redis_cluster_mode_enabled" {
  description = "Flag to enable Redis cluster mode for production for scalability and HA."
  type        = bool
  default     = true
}

variable "prod_redis_num_node_groups" {
  description = "Number of node groups (shards) for Redis cluster mode in production."
  type        = number
  default     = 3 # Only if cluster_mode_enabled is true
}

variable "prod_redis_replicas_per_node_group" {
  description = "Number of replicas per node group for Redis cluster mode in production."
  type        = number
  default     = 1 # Results in 2 nodes per shard (primary + replica)
}

variable "prod_enable_nat_gateway" {
  description = "Flag to enable NAT Gateway for prod environment. Highly recommended for HA."
  type        = bool
  default     = true
}

variable "prod_single_nat_gateway" {
  description = "Flag to use a single NAT Gateway for all AZs in prod. Set to false for HA NAT Gateways."
  type        = bool
  default     = false # For prod, use NAT gateway per AZ if enable_multi_az_prod is true.
}

variable "prod_allowed_ips_for_db_access" {
  description = "A list of strictly controlled IP addresses or CIDRs to allow access to MongoDB Atlas from production (e.g., NAT Gateway EIPs)."
  type        = list(string)
  default     = [] # Should be EIPs of NAT Gateways or Bastion Hosts.
}

variable "prod_atlas_provider_region_name" {
  description = "MongoDB Atlas provider region name for prod (e.g., US_EAST_1)."
  type        = string
  # Example: default = "US_EAST_1"
  # No default to force explicit setting.
}

variable "prod_enable_waf_protection" {
  description = "Flag to enable AWS WAF protection for public-facing endpoints in production."
  type        = bool
  default     = true
}

variable "prod_waf_web_acl_name" {
  description = "Name for the AWS WAFv2 Web ACL in production."
  type        = string
  default     = "glyph-puzzle-prod-waf-acl"
}

variable "prod_atlas_num_shards" {
  description = "Number of shards for MongoDB Atlas cluster in production. Only for M30+ tiers that support sharding."
  type        = number
  default     = 1 # Default to 1, increase if sharding is needed and supported by tier.
}

variable "prod_atlas_replication_factor" {
  description = "Replication factor for MongoDB Atlas cluster in production."
  type        = number
  default     = 3 # Standard for HA
}

variable "prod_custom_domain_name" {
  description = "Custom domain name for the production API Gateway (e.g., api.yourdomain.com)."
  type        = string
  default     = "" # Set if custom domain is used
}

variable "prod_certificate_arn" {
  description = "ACM Certificate ARN for the custom domain in production."
  type        = string
  default     = "" # Required if prod_custom_domain_name is set
}