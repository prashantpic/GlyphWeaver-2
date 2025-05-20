variable "instance_count_staging" {
  description = "Number of instances for services in staging."
  type        = number
  default     = 2
}

variable "db_backup_retention_staging" {
  description = "Backup retention period in days for staging database (conceptual, actual retention is set in Atlas module config)."
  type        = number
  default     = 7 # Days
}

variable "db_tier_staging" {
  description = "MongoDB Atlas cluster tier for staging (e.g., M10, M20)."
  type        = string
  default     = "M10"
}

variable "atlas_org_id_staging" {
  description = "MongoDB Atlas Organization ID for the staging environment."
  type        = string
  # No default, should be provided
}

variable "staging_vpc_cidr_block" {
  description = "CIDR block for the VPC in the staging environment."
  type        = string
  default     = "10.1.0.0/16"
}

variable "staging_public_subnet_cidrs" {
  description = "List of CIDR blocks for public subnets in the staging environment."
  type        = list(string)
  default     = ["10.1.1.0/24", "10.1.2.0/24"]
}

variable "staging_private_subnet_cidrs" {
  description = "List of CIDR blocks for private subnets in the staging environment."
  type        = list(string)
  default     = ["10.1.101.0/24", "10.1.102.0/24"]
}

variable "staging_availability_zones" {
  description = "List of Availability Zones for the staging environment."
  type        = list(string)
  # Example: default = ["us-east-1a", "us-east-1b"]
  # No default to force explicit setting based on region.
}

variable "staging_app_image_url" {
  description = "Docker image URL for the application in staging."
  type        = string
  # No default, should be set to a specific build artifact for staging
}

variable "staging_app_port" {
  description = "Port the application container listens on in staging."
  type        = number
  default     = 80
}

variable "staging_container_cpu" {
  description = "CPU units for the ECS task in staging."
  type        = number
  default     = 512 # Fargate: 0.5 vCPU
}

variable "staging_container_memory" {
  description = "Memory in MiB for the ECS task in staging."
  type        = number
  default     = 1024 # Fargate: 1GB
}

variable "staging_ecs_min_capacity" {
  description = "Minimum number of ECS tasks for auto-scaling in staging."
  type        = number
  default     = 2
}

variable "staging_ecs_max_capacity" {
  description = "Maximum number of ECS tasks for auto-scaling in staging."
  type        = number
  default     = 4
}

variable "staging_db_username" {
  description = "Database username for MongoDB Atlas in staging."
  type        = string
  default     = "staginguser"
}

variable "staging_db_password" {
  description = "Database password for MongoDB Atlas in staging."
  type        = string
  sensitive   = true
  # No default, should be provided via secure mechanism
}

variable "staging_cache_node_type" {
  description = "ElastiCache Redis node type for staging."
  type        = string
  default     = "cache.t3.small"
}

variable "staging_cache_engine_version" {
  description = "ElastiCache Redis engine version for staging."
  type        = string
  default     = "7.0"
}

variable "staging_enable_nat_gateway" {
  description = "Flag to enable NAT Gateway for staging environment."
  type        = bool
  default     = true
}

variable "staging_single_nat_gateway" {
  description = "Flag to use a single NAT Gateway for all AZs in staging."
  type        = bool
  default     = false # For staging, might want AZ-redundant NATs like prod
}

variable "staging_allowed_ips_for_db_access" {
  description = "A list of IP addresses or CIDRs to allow access to MongoDB Atlas for staging purposes (e.g., office IPs, VPN)."
  type        = list(string)
  default     = [] # Should be restricted
}

variable "staging_atlas_provider_region_name" {
  description = "MongoDB Atlas provider region name for staging (e.g., US_EAST_1)."
  type        = string
  # Example: default = "US_EAST_1"
  # No default to force explicit setting.
}

variable "staging_db_backup_policy" {
  description = "Backup policy configuration for staging MongoDB Atlas. See mongodbatlas_cloud_backup_schedule for structure."
  type        = any
  default     = null # Module should have a default or this needs to be structured.
  # Example based on mongodbatlas_cloud_backup_schedule "policies" block
  # This variable is conceptual for passing to the module which then constructs the resource.
  # The module itself should define the structure for this variable.
  # For `db_backup_retention_staging` to be used, the Atlas module needs logic for it.
  # Simple approach: module uses a fixed schedule but retention can be adjusted.
}