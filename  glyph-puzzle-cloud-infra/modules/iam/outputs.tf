# --- modules/iam/outputs.tf ---
# Purpose: Expose outputs from the IAM module.

output "iam_role_arn" {
  description = "ARN of the created IAM role."
  value       = aws_iam_role.main_role.arn
}

output "iam_role_name" {
  description = "Name of the created IAM role."
  value       = aws_iam_role.main_role.name
}

output "iam_role_unique_id" {
  description = "Unique ID of the created IAM role."
  value       = aws_iam_role.main_role.unique_id
}

output "iam_instance_profile_arn" {
  description = "ARN of the IAM instance profile, if created."
  value       = var.create_instance_profile ? aws_iam_instance_profile.main_instance_profile[0].arn : null
}

output "iam_instance_profile_name" {
  description = "Name of the IAM instance profile, if created."
  value       = var.create_instance_profile ? aws_iam_instance_profile.main_instance_profile[0].name : null
}