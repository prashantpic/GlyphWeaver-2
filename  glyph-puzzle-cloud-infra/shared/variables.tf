# --- shared/variables.tf ---
# Purpose: Define input variables for shared resources.

variable "project_name" {
  description = "The name of the project, used for tagging and naming resources."
  type        = string
}

variable "tags" {
  description = "A map of tags to assign to the resources."
  type        = map(string)
  default     = {}
}

variable "domain_name" {
  description = "The primary domain name for Route53 hosted zone (e.g., example.com). Leave empty to not create."
  type        = string
  default     = ""
}

variable "central_logging_bucket_name" {
  description = "Name for the central S3 bucket to store logs. Must be globally unique. Leave empty to not create."
  type        = string
  default     = ""
}

variable "configure_logging_bucket_acl" {
  description = "Whether to configure the 'log-delivery-write' ACL on the logging bucket. Set to false if ACLs are disabled on the bucket."
  type        = bool
  default     = true
}

variable "enable_bucket_versioning" {
  description = "Enable versioning for S3 buckets (logging and artifacts)."
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "Number of days to retain logs in the central logging S3 bucket. 0 for no expiration."
  type        = number
  default     = 365 # Default to 1 year
}

variable "artifacts_bucket_name" {
  description = "Name for the S3 bucket to store CI/CD artifacts. Must be globally unique. Leave empty to not create."
  type        = string
  default     = ""
}

# CI/CD Role Variables (REQ-8-008)
variable "create_cicd_role" {
  description = "Flag to create a shared IAM role for CI/CD systems."
  type        = bool
  default     = false # Default to false, enable if needed
}

variable "cicd_role_assume_policy_json" {
  description = "JSON policy document for the CI/CD role's trust relationship."
  type        = string
  default     = "" # Must be provided if create_cicd_role is true
  # Example for GitHub Actions OIDC:
  # {
  #   "Version": "2012-10-17",
  #   "Statement": [
  #     {
  #       "Effect": "Allow",
  #       "Principal": {
  #         "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
  #       },
  #       "Action": "sts:AssumeRoleWithWebIdentity",
  #       "Condition": {
  #         "StringEquals": {
  #           "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
  #         },
  #         "StringLike": {
  #           "token.actions.githubusercontent.com:sub": "repo:your-org/your-repo:*"
  #         }
  #       }
  #     }
  #   ]
  # }
}

variable "cicd_role_managed_policy_arns" {
  description = "List of managed policy ARNs to attach to the CI/CD role."
  type        = list(string)
  default     = []
  # Example: ["arn:aws:iam::aws:policy/AdministratorAccess"] (Use with extreme caution)
  # Better to create custom policies with least privilege.
}

variable "cicd_role_inline_policy_json" {
  description = "JSON string for an inline policy for the CI/CD role."
  type        = string
  default     = ""
}