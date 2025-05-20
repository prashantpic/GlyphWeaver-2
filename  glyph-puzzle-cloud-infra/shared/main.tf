# --- shared/main.tf ---
# Purpose: Provisions resources shared across all environments, such as Route53 hosted zones
# for DNS management, central S3 buckets for logging or artifacts, and shared IAM roles/policies
# for CI/CD or cross-account access. (REQ-8-008 for CI/CD support)

locals {
  project_name = var.project_name
  tags = merge(var.tags, {
    Terraform   = "true"
    Project     = local.project_name
    Scope       = "shared" # Indicates resource is shared across environments
    Module      = "shared"
  })
}

# Route53 Hosted Zone for the main domain
resource "aws_route53_zone" "primary_domain" {
  count = var.domain_name != "" ? 1 : 0
  name  = var.domain_name

  comment = "Primary DNS zone for ${var.project_name}"

  tags = local.tags
}

# Central S3 Bucket for Logging (e.g., ALB access logs, S3 server access logs)
resource "aws_s3_bucket" "central_logging_bucket" {
  count = var.central_logging_bucket_name != "" ? 1 : 0
  bucket = var.central_logging_bucket_name

  tags = local.tags
}

resource "aws_s3_bucket_acl" "central_logging_bucket_acl" {
  count  = var.central_logging_bucket_name != "" && var.configure_logging_bucket_acl ? 1 : 0
  bucket = aws_s3_bucket.central_logging_bucket[0].id
  acl    = "log-delivery-write" # Grants log delivery service permissions
}


resource "aws_s3_bucket_public_access_block" "central_logging_bucket_pab" {
  count  = var.central_logging_bucket_name != "" ? 1 : 0
  bucket = aws_s3_bucket.central_logging_bucket[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "central_logging_bucket_versioning" {
  count = var.central_logging_bucket_name != "" && var.enable_bucket_versioning ? 1 : 0
  bucket = aws_s3_bucket.central_logging_bucket[0].id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "central_logging_bucket_lifecycle" {
  count = var.central_logging_bucket_name != "" && var.log_retention_days > 0 ? 1 : 0
  bucket = aws_s3_bucket.central_logging_bucket[0].id

  rule {
    id     = "logExpiration"
    status = "Enabled"

    expiration {
      days = var.log_retention_days
    }
    # Noncurrent version expiration can also be configured if versioning is enabled
  }
}


# Central S3 Bucket for Artifacts (e.g., CI/CD build artifacts)
resource "aws_s3_bucket" "artifacts_bucket" {
  count = var.artifacts_bucket_name != "" ? 1 : 0
  bucket = var.artifacts_bucket_name

  tags = local.tags
}

resource "aws_s3_bucket_acl" "artifacts_bucket_acl" {
  count  = var.artifacts_bucket_name != "" ? 1 : 0
  bucket = aws_s3_bucket.artifacts_bucket[0].id
  acl    = "private" # Default private, access via IAM roles/policies
}

resource "aws_s3_bucket_public_access_block" "artifacts_bucket_pab" {
  count  = var.artifacts_bucket_name != "" ? 1 : 0
  bucket = aws_s3_bucket.artifacts_bucket[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "artifacts_bucket_versioning" {
  count = var.artifacts_bucket_name != "" && var.enable_bucket_versioning ? 1 : 0
  bucket = aws_s3_bucket.artifacts_bucket[0].id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "artifacts_bucket_sse" {
  count = var.artifacts_bucket_name != "" ? 1 : 0
  bucket = aws_s3_bucket.artifacts_bucket[0].id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "AES256"
    }
  }
}

# Optional: Shared IAM Role for CI/CD Systems (REQ-8-008)
resource "aws_iam_role" "shared_cicd_role" {
  count = var.create_cicd_role ? 1 : 0
  name  = "${local.project_name}-cicd-shared-role"
  assume_role_policy = var.cicd_role_assume_policy_json # Define trusted entities (e.g., GitHub Actions, Jenkins, CodePipeline)

  description = "Shared IAM role for CI/CD systems to manage infrastructure for ${local.project_name}"

  # Attach policies granting necessary permissions (e.g., to apply Terraform, manage ECS, S3)
  # managed_policy_arns = var.cicd_role_managed_policy_arns

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "cicd_role_attachments" {
  count      = var.create_cicd_role && length(var.cicd_role_managed_policy_arns) > 0 ? length(var.cicd_role_managed_policy_arns) : 0
  role       = aws_iam_role.shared_cicd_role[0].name
  policy_arn = var.cicd_role_managed_policy_arns[count.index]
}

# If specific inline policy is needed for CI/CD role
resource "aws_iam_policy" "cicd_inline_policy" {
  count = var.create_cicd_role && var.cicd_role_inline_policy_json != "" ? 1 : 0
  name  = "${local.project_name}-cicd-shared-inline-policy"
  policy = var.cicd_role_inline_policy_json
  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "cicd_attach_inline_policy" {
  count = var.create_cicd_role && var.cicd_role_inline_policy_json != "" ? 1 : 0
  role       = aws_iam_role.shared_cicd_role[0].name
  policy_arn = aws_iam_policy.cicd_inline_policy[0].arn
}