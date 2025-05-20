# --- modules/iap_gateway/variables.tf ---
# Purpose: Define input variables for the IAP Gateway module.

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

variable "api_name" {
  description = "Name for the API Gateway API. If empty, a default name is generated."
  type        = string
  default     = ""
}

variable "api_protocol_type" {
  description = "The protocol type for the API Gateway. Valid values are HTTP or WEBSOCKET."
  type        = string
  default     = "HTTP"
  validation {
    condition     = contains(["HTTP", "WEBSOCKET"], var.api_protocol_type)
    error_message = "API protocol type must be HTTP or WEBSOCKET."
  }
}

variable "integration_type" {
  description = "The integration type. e.g., AWS_PROXY (for Lambda), HTTP_PROXY (for ALB, NLB, other HTTP endpoints), MOCK, AWS (for direct AWS service integrations)."
  type        = string
  # Example: AWS_PROXY, HTTP_PROXY
}

variable "integration_uri" {
  description = "The URI of the integration backend. For AWS_PROXY, this is Lambda function ARN. For HTTP_PROXY, this is an HTTP URL or ALB/NLB listener ARN for private integration."
  type        = string
}

variable "payload_format_version" {
  description = "Payload format version for Lambda proxy integration ('1.0' or '2.0'). Required for AWS_PROXY."
  type        = string
  default     = "2.0" # Or "1.0"
}

variable "integration_method" {
  description = "HTTP method for HTTP_PROXY integration (e.g., ANY, GET, POST). Required for HTTP_PROXY."
  type        = string
  default     = "ANY" # Applicable if integration_type is HTTP_PROXY
}

variable "vpc_link_id" {
  description = "ID of the VPC Link if integrating with private resources via HTTP_PROXY."
  type        = string
  default     = null
}

# variable "integration_timeout" {
#   description = "Custom timeout in milliseconds for the integration. Between 50 and 29000 for HTTP APIs."
#   type        = number
#   default     = 29000
# }

# variable "integration_tls_server_name" {
#   description = "For HTTP_PROXY with TLS, the server name to verify. Only use if target has self-signed certs (not for prod)."
#   type        = string
#   default     = null
# }

variable "route_key" {
  description = "The route key for the API Gateway route (e.g., '$default', 'GET /items')."
  type        = string
  default     = "$default"
}

variable "stage_name" {
  description = "Name of the API Gateway stage (e.g., '$default', 'v1', 'dev'). '$default' auto-deploys."
  type        = string
  default     = "$default"
}

# variable "access_log_group_arn" {
#   description = "ARN of the CloudWatch Log Group for access logging. If null, access logging is disabled."
#   type        = string
#   default     = null
# }

# variable "authorizer_id" {
#   description = "ID of the authorizer to attach to the route, if authorization is needed."
#   type        = string
#   default     = null
# }

variable "custom_domain_name" {
  description = "Optional custom domain name to associate with the API Gateway."
  type        = string
  default     = null
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate for the custom domain name. Required if custom_domain_name is set."
  type        = string
  default     = null
}

# variable "api_mapping_key" {
#   description = "Optional base path for the API mapping (e.g., 'v1')."
#   type        = string
#   default     = null
# }

variable "grant_lambda_invoke_permission" {
  description = "Whether to grant API Gateway permission to invoke the Lambda function if integration_type is AWS_PROXY."
  type        = bool
  default     = true # Set to false if permissions are managed elsewhere
}

# variable "integration_method_for_permission" {
#   description = "HTTP method part of the source ARN for Lambda permission (e.g., GET, POST, *)."
#   type        = string
#   default     = "*"
# }

# variable "integration_path_for_permission" {
#   description = "Path part of the source ARN for Lambda permission (e.g., /items, /*)."
#   type        = string
#   default     = "/*"
# }