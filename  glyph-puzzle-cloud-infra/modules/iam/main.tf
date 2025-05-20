# --- modules/iam/main.tf ---
# Purpose: Defines IAM roles and policies for CI/CD pipelines, application services
# (ECS tasks, Lambda functions), and other AWS services, adhering to the principle of least privilege.
# Contributes to REQ-8-008 by providing necessary permissions for services.

locals {
  project_name = var.project_name
  environment  = var.environment
  tags = merge(var.tags, {
    Terraform   = "true"
    Project     = local.project_name
    Environment = local.environment
    Module      = "iam"
  })
}

resource "aws_iam_role" "main_role" {
  name                 = "${var.role_name_prefix}-${local.environment}"
  assume_role_policy   = var.assume_role_policy_json
  description          = var.role_description != "" ? var.role_description : "IAM role for ${var.role_name_prefix} in ${local.environment}"
  max_session_duration = var.max_session_duration
  path                 = var.role_path

  # permissions_boundary = var.permissions_boundary_arn

  tags = local.tags
}

# Attach managed policies
resource "aws_iam_role_policy_attachment" "managed_policies" {
  count      = length(var.managed_policy_arns)
  role       = aws_iam_role.main_role.name
  policy_arn = var.managed_policy_arns[count.index]
}

# Create and attach inline policies
resource "aws_iam_policy" "inline_policies" {
  for_each = var.inline_policies

  name        = "${var.role_name_prefix}-${each.key}-${local.environment}"
  description = "Inline policy ${each.key} for role ${var.role_name_prefix}-${local.environment}"
  policy      = each.value
  path        = var.role_path

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "attach_inline_policies" {
  for_each = aws_iam_policy.inline_policies

  role       = aws_iam_role.main_role.name
  policy_arn = each.value.arn
}


# Optional: Create IAM instance profile if this role is for EC2 instances
resource "aws_iam_instance_profile" "main_instance_profile" {
  count = var.create_instance_profile ? 1 : 0
  name  = "${var.role_name_prefix}-profile-${local.environment}"
  role  = aws_iam_role.main_role.name
  path  = var.role_path

  tags = local.tags
}