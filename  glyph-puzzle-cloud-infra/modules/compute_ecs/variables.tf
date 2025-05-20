# --- modules/compute_ecs/variables.tf ---
# Purpose: Define input variables for the ECS compute module.

variable "project_name" {
  description = "The name of the project, used for tagging and naming resources."
  type        = string
}

variable "environment" {
  description = "The deployment environment (e.g., dev, staging, prod)."
  type        = string
}

variable "aws_region" {
  description = "The AWS region where resources are deployed."
  type        = string
}

variable "tags" {
  description = "A map of tags to assign to the resources."
  type        = map(string)
  default     = {}
}

variable "app_name" {
  description = "Name of the application/service being deployed."
  type        = string
}

variable "app_image_url" {
  description = "URL of the Docker image for the application (e.g., from ECR)."
  type        = string
}

variable "app_port" {
  description = "The port on which the application container listens."
  type        = number
}

variable "container_cpu" {
  description = "CPU units to allocate to the container (e.g., 256, 512, 1024)."
  type        = number
}

variable "container_memory" {
  description = "Memory (in MiB) to allocate to the container (e.g., 512, 1024, 2048)."
  type        = number
}

variable "container_environment_variables" {
  description = "A list of environment variables for the container. Each element is a map with 'name' and 'value'."
  type        = list(object({ name = string, value = string }))
  default     = []
}

variable "container_secrets" {
  description = "A list of secrets for the container. Each element is a map with 'name' and 'valueFrom' (ARN of Secrets Manager secret or SSM parameter)."
  type        = list(object({ name = string, valueFrom = string }))
  default     = []
}

variable "desired_count" {
  description = "Initial desired number of tasks for the ECS service."
  type        = number
}

variable "ecs_task_execution_role_arn" {
  description = "ARN of the IAM role for ECS task execution (pulling images, writing logs)."
  type        = string
}

variable "ecs_task_role_arn" {
  description = "ARN of the IAM role for the ECS task itself (application permissions)."
  type        = string
  default     = null # Optional
}

variable "vpc_id" {
  description = "ID of the VPC where the ECS cluster and services will be deployed."
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the ALB."
  type        = list(string)
}

variable "service_subnet_ids" {
  description = "List of subnet IDs where the ECS service tasks will be placed (typically private subnets)."
  type        = list(string)
}

variable "service_security_group_ids" {
  description = "List of security group IDs to associate with the ECS service tasks."
  type        = list(string)
}

variable "service_assign_public_ip" {
  description = "Whether to assign public IP addresses to Fargate tasks. Usually false if behind an ALB."
  type        = bool
  default     = false
}

variable "health_check_path" {
  description = "Path for the load balancer health check."
  type        = string
  default     = "/health"
}

variable "log_retention_days" {
  description = "Number of days to retain ECS application logs in CloudWatch."
  type        = number
  default     = 30
}

# ALB Variables
variable "alb_internal" {
  description = "Whether the ALB is internal or internet-facing."
  type        = bool
  default     = false
}

variable "alb_security_group_ids" {
  description = "List of security group IDs for the Application Load Balancer."
  type        = list(string)
}

variable "enable_http_listener" {
  description = "Flag to enable HTTP listener on port 80 for the ALB."
  type        = bool
  default     = true
}

variable "enable_https_listener" {
  description = "Flag to enable HTTPS listener on port 443 for the ALB."
  type        = bool
  default     = false # Default to false, requires certificate_arn
}

variable "alb_certificate_arn" {
  description = "ARN of the ACM certificate for the HTTPS listener. Required if enable_https_listener is true."
  type        = string
  default     = null
}

# Auto Scaling Variables (REQ-8-008)
variable "enable_autoscaling" {
  description = "Flag to enable auto-scaling for the ECS service."
  type        = bool
  default     = true
}

variable "min_capacity" {
  description = "Minimum number of tasks for auto-scaling."
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Maximum number of tasks for auto-scaling."
  type        = number
  default     = 3
}

variable "cpu_scaling_threshold" {
  description = "Target CPU utilization percentage for CPU-based auto-scaling. Set to 0 to disable."
  type        = number
  default     = 75 # e.g., scale out if CPU > 75%
}

variable "memory_scaling_threshold" {
  description = "Target memory utilization percentage for memory-based auto-scaling. Set to 0 to disable."
  type        = number
  default     = 75 # e.g., scale out if Memory > 75%
}

variable "alb_request_count_per_target" {
  description = "Target number of ALB requests per target for request-based auto-scaling. Set to 0 to disable."
  type        = number
  default     = 0 # e.g., 1000 requests per target
}

variable "scale_in_cooldown" {
  description = "Cooldown period (in seconds) before another scale-in activity can start."
  type        = number
  default     = 300
}

variable "scale_out_cooldown" {
  description = "Cooldown period (in seconds) before another scale-out activity can start."
  type        = number
  default     = 60
}