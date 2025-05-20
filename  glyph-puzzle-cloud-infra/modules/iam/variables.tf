# --- modules/iam/variables.tf ---
# Purpose: Define input variables for the IAM module.

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

variable "role_name_prefix" {
  description = "A prefix for the IAM role name. Environment will be appended."
  type        = string
}

variable "assume_role_policy_json" {
  description = "The JSON-formatted policy that grants an entity permission to assume the role."
  type        = string
}

variable "role_description" {
  description = "Description for the IAM role."
  type        = string
  default     = ""
}

variable "max_session_duration" {
  description = "The maximum session duration (in seconds) that you want to set for the specified role. Default is 3600."
  type        = number
  default     = 3600
}

variable "role_path" {
  description = "Path for the IAM role."
  type        = string
  default     = "/"
}

# variable "permissions_boundary_arn" {
#   description = "ARN of the policy that is used to set the permissions boundary for the role."
#   type        = string
#   default     = null
# }

variable "managed_policy_arns" {
  description = "List of ARNs of IAM managed policies to attach to the role."
  type        = list(string)
  default     = []
}

variable "inline_policies" {
  description = "A map of inline policies to attach to the role. Key is policy name, value is policy JSON string."
  type        = map(string)
  default     = {}
}

variable "create_instance_profile" {
  description = "Flag to create an IAM instance profile for this role (for EC2)."
  type        = bool
  default     = false
}