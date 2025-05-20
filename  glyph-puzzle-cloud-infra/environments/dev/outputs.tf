output "dev_app_url" {
  description = "URL for the development application endpoint (ALB or API Gateway)."
  # value       = module.compute_ecs_dev.app_load_balancer_dns_name # Or module.iap_gateway_dev.iap_gateway_invoke_url
  value = "http://${module.compute_ecs_dev.app_load_balancer_dns_name}" # Assuming ALB is primary access for dev
}

output "dev_db_connection_string" {
  description = "Connection string for the development MongoDB Atlas database."
  value       = module.database_mongodb_atlas_dev.mongodb_atlas_cluster_connection_string_standard_srv # Or standard, srv is generally preferred
  sensitive   = true
}

output "dev_vpc_id" {
  description = "ID of the VPC for the dev environment."
  value       = module.networking_dev.vpc_id
}

output "dev_public_subnet_ids" {
  description = "IDs of the public subnets for the dev environment."
  value       = module.networking_dev.public_subnet_ids
}

output "dev_private_subnet_ids" {
  description = "IDs of the private subnets for the dev environment."
  value       = module.networking_dev.private_subnet_ids
}

output "dev_ecs_cluster_name" {
  description = "Name of the ECS cluster for the dev environment."
  value       = module.compute_ecs_dev.ecs_cluster_name
}

output "dev_ecs_service_name" {
  description = "Name of the ECS service for the dev environment."
  value       = module.compute_ecs_dev.ecs_service_name
}

output "dev_redis_primary_endpoint" {
  description = "Primary endpoint address for the Redis cache in dev."
  value       = module.caching_redis_dev.redis_primary_endpoint_address
}

output "dev_app_security_group_id" {
  description = "ID of the application security group in dev."
  value       = module.security_dev.app_security_group_id
}

output "dev_cache_security_group_id" {
  description = "ID of the cache security group in dev."
  value       = module.security_dev.cache_security_group_id
}

output "dev_kms_key_arn" {
  description = "ARN of the KMS key for the dev environment."
  value       = module.security_dev.kms_key_arn
}

output "dev_iap_gateway_invoke_url" {
  description = "Invoke URL for the IAP Gateway in dev."
  value       = module.iap_gateway_dev.iap_gateway_invoke_url
}