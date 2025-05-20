# --- modules/security/outputs.tf ---
# Purpose: Expose outputs from the security module.

output "app_security_group_id" {
  description = "ID of the application security group."
  value       = aws_security_group.app_sg.id
}

# output "db_security_group_id" {
#   description = "ID of the database security group, if created."
#   value       = var.create_db_sg ? aws_security_group.db_sg[0].id : null
# }

# Caching SG is created within caching_redis module.
# If this module were to create it:
# output "cache_security_group_id" {
#   description = "ID of the cache security group, if created."
#   value       = <some_cache_sg_resource>.id
# }

output "kms_key_arn" {
  description = "ARN of the KMS key."
  value       = aws_kms_key.main_key.arn
}

output "kms_key_id" {
  description = "ID of the KMS key."
  value       = aws_kms_key.main_key.key_id
}

output "kms_key_alias_name" {
  description = "Alias name of the KMS key."
  value       = aws_kms_alias.main_key_alias.name
}

output "kms_key_alias_arn" {
  description = "Alias ARN of the KMS key."
  value       = aws_kms_alias.main_key_alias.arn
}

output "waf_web_acl_arn" {
  description = "ARN of the WAF WebACL, if created."
  value       = var.enable_waf ? aws_wafv2_web_acl.main_waf[0].arn : null
}

output "waf_web_acl_id" {
  description = "ID of the WAF WebACL, if created."
  value       = var.enable_waf ? aws_wafv2_web_acl.main_waf[0].id : null
}