output "staging_app_url" {
  description = "URL for the staging application endpoint (ALB or API Gateway)."
  value       = "http://${module.compute_ecs_staging.app_load_balancer_dns_name}"
}

output "staging_db_connection_string" {
  description = "Connection string for the staging MongoDB Atlas database."
  value       = module.database_mongodb_atlas_staging.mongodb_atlas_cluster_connection_string_standard_srv
  sensitive   = true
}

output "staging_vpc_id" {
  description = "ID of the VPC for the staging environment."
  value       = module.networking_staging.vpc_id
}

output "staging_public_subnet_ids" {
  description = "IDs of the public subnets for the staging environment."
  value       = module.networking_staging.public_subnet_ids
}

output "staging_private_subnet_ids" {
  description = "IDs of the private subnets for the staging environment."
  value       = module.networking_staging.private_subnet_ids
}

output "staging_ecs_cluster_name" {
  description = "Name of the ECS cluster for the staging environment."
  value       = module.compute_ecs_staging.ecs_cluster_name
}

output "staging_ecs_service_name" {
  description = "Name of the ECS service for the staging environment."
  value       = module.compute_ecs_staging.ecs_service_name
}

output "staging_redis_primary_endpoint" {
  description = "Primary endpoint address for the Redis cache in staging."
  value       = module.caching_redis_staging.redis_primary_endpoint_address
}

output "staging_app_security_group_id" {
  description = "ID of the application security group in staging."
  value       = module.security_staging.app_security_group_id
}

output "staging_cache_security_group_id" {
  description = "ID of the cache security group in staging."
  value       = module.security_staging.cache_security_group_id
}

output "staging_kms_key_arn" {
  description = "ARN of the KMS key for the staging environment."
  value       = module.security_staging.kms_key_arn
}

output "staging_iap_gateway_invoke_url" {
  description = "Invoke URL for the IAP Gateway in staging."
  value       = module.iap_gateway_staging.iap_gateway_invoke_url
}