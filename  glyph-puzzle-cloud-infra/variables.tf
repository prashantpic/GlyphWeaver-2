variable "project_name" {
  type        = string
  description = "The name of the project, used for naming and tagging resources."
  default     = "glyph-puzzle"
}

variable "environment_prefix" {
  type        = string
  description = "A prefix for naming resources based on the environment (e.g., 'dev', 'staging', 'prod'). This will typically be set at the environment level."
  default     = "common" # Default for root, environments will override or use their specific names.
}

variable "default_tags" {
  type        = map(string)
  description = "Default tags to apply to all taggable resources."
  default = {
    Project   = "GlyphPuzzle"
    ManagedBy = "Terraform"
  }
}

variable "aws_region" {
  type        = string
  description = "The primary AWS region for deployment."
  default     = "us-east-1" # Example default, consider making this mandatory or environment-specific
}

# Variables for S3 Backend Configuration
# These are typically passed via -backend-config or environment variables during `terraform init`
# Defining them here for completeness and potential use if not using -backend-config for all.
variable "terraform_backend_bucket" {
  type        = string
  description = "The name of the S3 bucket for Terraform remote state."
  # No default, should be configured per deployment.
}

variable "terraform_backend_key" {
  type        = string
  description = "The path to the state file in the S3 bucket for Terraform remote state."
  default     = "glyph-puzzle-cloud-infra/terraform.tfstate"
}

variable "terraform_backend_region" {
  type        = string
  description = "The AWS region of the S3 bucket for Terraform remote state."
  # No default, should be configured per deployment.
}

variable "terraform_backend_dynamodb_table" {
  type        = string
  description = "The name of the DynamoDB table for Terraform state locking."
  # No default, should be configured per deployment.
}

# Variables for MongoDB Atlas Provider
variable "atlas_public_key" {
  type        = string
  description = "MongoDB Atlas Public API Key. It is recommended to set this via an environment variable TF_VAR_atlas_public_key."
  nullable    = false
  # No default for sensitive data.
}

variable "atlas_private_key" {
  type        = string
  description = "MongoDB Atlas Private API Key. It is recommended to set this via an environment variable TF_VAR_atlas_private_key."
  sensitive   = true
  nullable    = false
  # No default for sensitive data.
}

# Variables for the shared module instantiation in main.tf
variable "shared_domain_name" {
  type        = string
  description = "The domain name for shared resources like Route53 hosted zone."
  # Example: "glyphpuzzle.com" - This should be set based on actual domain.
}

variable "shared_central_logging_bucket_name" {
  type        = string
  description = "The name for the central S3 bucket for logs (e.g., VPC flow logs, ALB access logs)."
  # Example: "glyphpuzzle-central-logs" - Ensure this is globally unique.
}

variable "shared_artifacts_bucket_name" {
  type        = string
  description = "The name for the S3 bucket for CI/CD artifacts."
  # Example: "glyphpuzzle-cicd-artifacts" - Ensure this is globally unique.
}