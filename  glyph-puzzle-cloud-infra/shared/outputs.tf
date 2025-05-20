# --- shared/outputs.tf ---
# Purpose: Expose outputs from shared resources.

output "route53_zone_id" {
  description = "ID of the primary Route53 hosted zone, if created."
  value       = var.domain_name != "" ? aws_route53_zone.primary_domain[0].zone_id : null
}

output "route53_zone_name_servers" {
  description = "Name servers for the primary Route53 hosted zone, if created."
  value       = var.domain_name != "" ? aws_route53_zone.primary_domain[0].name_servers : null
}

output "central_logging_bucket_id" {
  description = "ID (name) of the central logging S3 bucket, if created."
  value       = var.central_logging_bucket_name != "" ? aws_s3_bucket.central_logging_bucket[0].id : null
}

output "central_logging_bucket_arn" {
  description = "ARN of the central logging S3 bucket, if created."
  value       = var.central_logging_bucket_name != "" ? aws_s3_bucket.central_logging_bucket[0].arn : null
}

output "artifacts_bucket_id" {
  description = "ID (name) of the artifacts S3 bucket, if created."
  value       = var.artifacts_bucket_name != "" ? aws_s3_bucket.artifacts_bucket[0].id : null
}

output "artifacts_bucket_arn" {
  description = "ARN of the artifacts S3 bucket, if created."
  value       = var.artifacts_bucket_name != "" ? aws_s3_bucket.artifacts_bucket[0].arn : null
}

output "cicd_role_arn" {
  description = "ARN of the shared CI/CD IAM role, if created."
  value       = var.create_cicd_role ? aws_iam_role.shared_cicd_role[0].arn : null
}

output "cicd_role_name" {
  description = "Name of the shared CI/CD IAM role, if created."
  value       = var.create_cicd_role ? aws_iam_role.shared_cicd_role[0].name : null
}