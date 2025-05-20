variable "instance_count_dev" {
  description = "Number of instances for services in dev."
  type        = number
  default     = 1
}

variable "enable_detailed_logging_dev" {
  description = "Flag to enable more verbose logging in dev."
  type        = bool
  default     = true
}

variable "db_tier_dev" {
  description = "MongoDB Atlas cluster tier for dev (e.g., M0, M2, M5)."
  type        = string
  default     = "M0" # Free tier for dev
}

variable "atlas_org_id_dev" {
  description = "MongoDB Atlas Organization ID for the dev environment."
  type        = string
  # No default, should be provided
}

variable "dev_vpc_cidr_block" {
  description = "CIDR block for the VPC in the dev environment."
  type        = string
  default     = "10.0.0.0/16"
}

variable "dev_public_subnet_cidrs" {
  description = "List of CIDR blocks for public subnets in the dev environment."
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "dev_private_subnet_cidrs" {
  description = "List of CIDR blocks for private subnets in the dev environment."
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24"]
}

variable "dev_availability_zones" {
  description = "List of Availability Zones for the dev environment."
  type        = list(string)
  # Example: default = ["us-east-1a", "us-east-1b"]
  # This should be compatible with the AWS region from global variables.
  # No default to force explicit setting based on region.
}

variable "dev_app_image_url" {
  description = "Docker image URL for the application in dev."
  type        = string
  default     = "nginx:latest" # Placeholder
}

variable "dev_app_port" {
  description = "Port the application container listens on in dev."
  type        = number
  default     = 80
}

variable "dev_container_cpu" {
  description = "CPU units for the ECS task in dev."
  type        = number
  default     = 256 # Fargate: 0.25 vCPU
}

variable "dev_container_memory" {
  description = "Memory in MiB for the ECS task in dev."
  type        = number
  default     = 512 # Fargate: 0.5GB
}

variable "dev_ecs_min_capacity" {
  description = "Minimum number of ECS tasks for auto-scaling in dev."
  type        = number
  default     = 1
}

variable "dev_ecs_max_capacity" {
  description = "Maximum number of ECS tasks for auto-scaling in dev."
  type        = number
  default     = 2
}

variable "dev_db_username" {
  description = "Database username for MongoDB Atlas in dev."
  type        = string
  default     = "devuser"
}

variable "dev_db_password" {
  description = "Database password for MongoDB Atlas in dev."
  type        = string
  sensitive   = true
  # No default, should be provided via secure mechanism
}

variable "dev_cache_node_type" {
  description = "ElastiCache Redis node type for dev."
  type        = string
  default     = "cache.t3.micro"
}

variable "dev_cache_engine_version" {
  description = "ElastiCache Redis engine version for dev."
  type        = string
  default     = "7.0"
}

variable "dev_enable_nat_gateway" {
  description = "Flag to enable NAT Gateway for dev environment."
  type        = bool
  default     = true # Typically needed for private subnets to access internet
}

variable "dev_single_nat_gateway" {
  description = "Flag to use a single NAT Gateway for all AZs in dev (cost saving)."
  type        = bool
  default     = true
}

variable "dev_allowed_ip_for_db_access" {
  description = "A specific IP address or CIDR to allow access to MongoDB Atlas for dev purposes (e.g., developer's IP). Use '0.0.0.0/0' for open access (NOT recommended for anything other than temporary dev)."
  type        = string
  default     = "0.0.0.0/0" # Placeholder, should be restricted
}

variable "dev_atlas_provider_region_name" {
  description = "MongoDB Atlas provider region name for dev (e.g., US_EAST_1)."
  type        = string
  # Example: default = "US_EAST_1"
  # No default to force explicit setting.
}