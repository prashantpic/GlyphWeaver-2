# --- modules/caching_redis/outputs.tf ---
# Purpose: Expose outputs from the Redis module.

output "redis_replication_group_id" {
  description = "The ID of the ElastiCache Redis replication group."
  value       = aws_elasticache_replication_group.redis_replication_group.id
}

output "redis_primary_endpoint_address" {
  description = "The DNS address of the primary replication group endpoint."
  value       = aws_elasticache_replication_group.redis_replication_group.primary_endpoint_address
}

output "redis_primary_endpoint_port" {
  description = "The port number of the primary replication group endpoint."
  value       = aws_elasticache_replication_group.redis_replication_group.port
}

output "redis_reader_endpoint_address" {
  description = "The DNS address of the reader replication group endpoint (if applicable)."
  value       = var.cluster_mode_enabled ? null : (var.num_cache_clusters_non_clustered > 1 || var.automatic_failover_enabled ? aws_elasticache_replication_group.redis_replication_group.reader_endpoint_address : null)
}

output "redis_configuration_endpoint_address" {
  description = "The configuration endpoint address for Redis (cluster mode enabled)."
  value       = var.cluster_mode_enabled ? aws_elasticache_replication_group.redis_replication_group.configuration_endpoint_address : null
}

output "redis_security_group_id" {
  description = "The ID of the security group created for the Redis cluster."
  value       = aws_security_group.redis_sg.id
}

output "redis_subnet_group_name" {
  description = "The name of the ElastiCache subnet group."
  value       = aws_elasticache_subnet_group.redis_subnet_group.name
}

output "redis_parameter_group_name" {
  description = "The name of the ElastiCache parameter group."
  value       = aws_elasticache_parameter_group.redis_param_group.name
}