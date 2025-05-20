output "prod_app_url" {
  description = "URL for the production application endpoint (ALB or API Gateway)."
  value       = module.iap_gateway_prod.iap_gateway_custom_domain_endpoint != "" ? "https://${module.iap_gateway_prod.iap_gateway_custom_domain_endpoint}" : module.iap_gateway_prod.iap_gateway_invoke_url
}

output "prod_db_connection_string" {
  description = "Connection string for the production MongoDB Atlas database."
  value       = module.database_mongodb_atlas_prod.mongodb_atlas_cluster_connection_string_standard_srv
  sensitive   = true
}

output "prod_vpc_id" {
  description = "ID of the VPC for the prod environment."
  value       = module.networking_prod.vpc_id
}

output "prod_public_subnet_ids" {
  description = "IDs of the public subnets for the prod environment."
  value       = module.networking_prod.public_subnet_ids
}

output "prod_private_subnet_ids" {
  description = "IDs of the private subnets for the prod environment."
  value       = module.networking_prod.private_subnet_ids
}

output "prod_ecs_cluster_name" {
  description = "Name of the ECS cluster for the prod environment."
  value       = module.compute_ecs_prod.ecs_cluster_name
}

output "prod_ecs_service_name" {
  description = "Name of the ECS service for the prod environment."
  value       = module.compute_ecs_prod.ecs_service_name
}

output "prod_redis_primary_endpoint" {
  description = "Primary endpoint address for the Redis cache in prod."
  value       = module.caching_redis_prod.redis_primary_endpoint_address
}

output "prod_app_security_group_id" {
  description = "ID of the application security group in prod."
  value       = module.security_prod.app_security_group_id
}

output "prod_cache_security_group_id" {
  description = "ID of the cache security group in prod."
  value       = module.security_prod.cache_security_group_id
}

output "prod_kms_key_arn" {
  description = "ARN of the KMS key for the prod environment."
  value       = module.security_prod.kms_key_arn
}

output "prod_waf_web_acl_arn" {
  description = "ARN of the WAF WebACL if enabled for prod."
  value       = var.prod_enable_waf_protection ? module.security_prod.waf_web_acl_arn : "WAF_Not_Enabled"
}

output "prod_iap_gateway_invoke_url" {
  description = "Invoke URL for the IAP Gateway in prod."
  value       = module.iap_gateway_prod.iap_gateway_invoke_url
}

output "prod_iap_gateway_custom_domain_endpoint" {
  description = "Custom domain endpoint for the IAP Gateway in prod, if configured."
  value       = module.iap_gateway_prod.iap_gateway_custom_domain_endpoint
}