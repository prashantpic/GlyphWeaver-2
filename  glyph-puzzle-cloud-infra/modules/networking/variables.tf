# --- modules/networking/variables.tf ---
# Purpose: Define input variables for the networking module.

variable "project_name" {
  description = "The name of the project, used for tagging and naming resources."
  type        = string
}

variable "environment" {
  description = "The deployment environment (e.g., dev, staging, prod)."
  type        = string
}

variable "tags" {
  description = "A map of tags to assign to the resources."
  type        = map(string)
  default     = {}
}

variable "vpc_cidr_block" {
  description = "The CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "A list of CIDR blocks for public subnets."
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "A list of CIDR blocks for private subnets."
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24"]
}

variable "availability_zones" {
  description = "A list of availability zones to deploy resources into."
  type        = list(string)
  # Example: ["us-east-1a", "us-east-1b"]
  # This should be configured at the environment level based on the chosen region.
}

variable "enable_nat_gateway" {
  description = "Flag to enable/disable NAT Gateway creation for private subnets."
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "Flag to deploy a single NAT Gateway instead of one per AZ. If true, private subnets in all AZs will route through this single NAT GW."
  type        = bool
  default     = false
}

variable "enable_flow_logs" {
  description = "Flag to enable VPC flow logs."
  type        = bool
  default     = false # Usually enabled for prod or staging
}

variable "flow_log_retention_days" {
  description = "Retention period in days for VPC flow logs in CloudWatch."
  type        = number
  default     = 30
}