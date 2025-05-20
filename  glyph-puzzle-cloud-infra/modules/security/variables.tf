# --- modules/security/variables.tf ---
# Purpose: Define input variables for the security module.

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

variable "vpc_id" {
  description = "ID of the VPC where security groups will be created."
  type        = string
}

variable "security_group_name_prefix" {
  description = "Prefix for security group names."
  type        = string
  default     = "glyphpuzzle"
}

variable "app_ingress_rules" {
  description = "List of ingress rules for the application security group. Each rule is an object."
  type        = any # list(object) with from_port, to_port, protocol, cidr_blocks/security_groups etc.
  default     = []
  # Example:
  # [
  #   { from_port = 443, to_port = 443, protocol = "tcp", cidr_blocks = ["0.0.0.0/0"], description = "Allow HTTPS from anywhere" },
  #   { from_port = 80, to_port = 80, protocol = "tcp", security_groups = [module.alb.security_group_id], description = "Allow HTTP from ALB" }
  # ]
}

variable "app_egress_rules" {
  description = "List of egress rules for the application security group. Each rule is an object."
  type        = any # list(object)
  default = [ # Default to allow all outbound. Restrict as needed.
    { from_port = 0, to_port = 0, protocol = "-1", cidr_blocks = ["0.0.0.0/0"], description = "Allow all outbound" }
  ]
}

# variable "create_db_sg" {
#   description = "Flag to create a generic database security group."
#   type        = bool
#   default     = false
# }

# KMS Variables
variable "kms_key_alias_name" {
  description = "Alias name for the KMS key (environment will be appended)."
  type        = string
}

variable "kms_key_description" {
  description = "Description for the KMS key."
  type        = string
  default     = ""
}

variable "kms_key_deletion_window_in_days" {
  description = "Deletion window in days for the KMS key (7-30). 0 to disable deletion window (not recommended)."
  type        = number
  default     = 7
  validation {
    condition     = var.kms_key_deletion_window_in_days == 0 || (var.kms_key_deletion_window_in_days >= 7 && var.kms_key_deletion_window_in_days <= 30)
    error_message = "KMS key deletion window must be between 7 and 30 days, or 0 to disable (not recommended)."
  }
}

variable "enable_kms_key_rotation" {
  description = "Flag to enable automatic KMS key rotation."
  type        = bool
  default     = true
}

variable "kms_key_policy_json" {
  description = "JSON policy document for the KMS key. If not provided, a default policy is created allowing root user full access."
  type        = string
  default     = null # Requires careful consideration for a default.
}

# WAF Variables
variable "enable_waf" {
  description = "Flag to enable AWS WAFv2 WebACL."
  type        = bool
  default     = false
}

variable "waf_web_acl_name" {
  description = "Name for the WAF WebACL. If empty, a default name is generated."
  type        = string
  default     = ""
}

variable "waf_scope" {
  description = "Specifies whether this is for an AWS CloudFront distribution or for a regional application. Valid values are CLOUDFRONT or REGIONAL."
  type        = string
  default     = "REGIONAL" # For ALB, API Gateway v2
  validation {
    condition     = contains(["CLOUDFRONT", "REGIONAL"], var.waf_scope)
    error_message = "WAF scope must be CLOUDFRONT or REGIONAL."
  }
}

# variable "waf_rate_limit_threshold" {
#   description = "Threshold for rate-based WAF rule (requests per 5 minutes)."
#   type        = number
#   default     = 2000
# }

variable "waf_rules" {
  description = "A list of rule objects to apply to the WAF WebACL. Each object defines name, priority, action, statement (JSON), and visibility_config."
  type        = any # list(object)
  default     = []
  # Example:
  # [
  #   {
  #     name     = "AWSManagedRulesCommonRuleSet",
  #     priority = 10,
  #     action   = { none = {} }, # To use managed rule group's default actions, or override
  #     statement_json = jsonencode({ # Terraform versions >= 0.12 can use maps directly
  #       managed_rule_group_statement = {
  #         name        = "AWSManagedRulesCommonRuleSet"
  #         vendor_name = "AWS"
  #         # excluded_rules = [{name = "SizeRestrictions_BODY"}]
  #       }
  #     }),
  #     visibility_config = {
  #       cloudwatch_metrics_enabled = true,
  #       metric_name                = "AWSManagedRulesCommon",
  #       sampled_requests_enabled   = true
  #     }
  #   }
  # ]
}

variable "waf_resource_arn" {
  description = "ARN of the resource to associate WAF with (e.g., ALB ARN). If null, no association is created by this module."
  type        = string
  default     = null
}