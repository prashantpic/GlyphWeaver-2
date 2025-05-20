# Root main.tf
# This file is the main entry point for the Terraform configuration.
# It can orchestrate shared resources and environment-specific deployments.

# Instantiate shared resources module
# These resources are common across all environments or foundational for the AWS account.
# REQ-8-008: Supports CI/CD infrastructure (artifact storage, potentially IAM roles).
module "shared" {
  source = "./modules/shared"

  project_name                = var.project_name
  domain_name                 = var.shared_domain_name
  central_logging_bucket_name = var.shared_central_logging_bucket_name
  artifacts_bucket_name       = var.shared_artifacts_bucket_name

  tags = var.default_tags
}

# Environment modules (dev, staging, prod) will be defined within their respective directories
# (e.g., ./environments/dev/main.tf) and typically applied as separate configurations
# or workspaces, rather than being directly instantiated here in a single root apply,
# unless a monorepo-style single apply is intended for all environments.
# The current structure suggests separate environment directories, so this root main.tf
# focuses on truly global/shared resources not tied to a single environment.