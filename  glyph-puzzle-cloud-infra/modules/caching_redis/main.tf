# --- modules/caching_redis/main.tf ---
# Purpose: Provisions AWS ElastiCache for Redis, including replication group
# (for cluster mode or HA), subnet group, parameter group, and security group.
# Fulfills backend-cache-provider component (REQ-8-008).

locals {
  project_name = var.project_name
  environment  = var.environment
  tags = merge(var.tags, {
    Terraform   = "true"
    Project     = local.project_name
    Environment = local.environment
    Module      = "caching-redis"
    Component   = "backend-cache-provider"
  })
  replication_group_id = substr("${local.project_name}-redis-${local.environment}", 0, var.cluster_mode_enabled ? 40 : 50) # Max length constraint
}

resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name       = "${local.project_name}-redis-subnet-group-${local.environment}"
  subnet_ids = var.subnet_ids # Should be private subnets

  tags = local.tags
}

resource "aws_security_group" "redis_sg" {
  name        = "${local.project_name}-redis-sg-${local.environment}"
  description = "Security group for ElastiCache Redis cluster"
  vpc_id      = var.vpc_id

  # Ingress: Allow traffic from application security group on Redis port
  # This will be configured using aws_security_group_rule externally or by passing app_sg_id
  # For simplicity, allowing from VPC CIDR, but specific SG is better.
  ingress {
    from_port   = var.port
    to_port     = var.port
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks # Can be VPC CIDR or specific app SG id
    # security_groups = [var.application_security_group_id] # Preferred
    description = "Allow Redis traffic from application"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1" # Allow all outbound traffic
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.tags
}

resource "aws_elasticache_parameter_group" "redis_param_group" {
  name   = "${local.project_name}-redis-params-${local.environment}"
  family = var.cache_engine_version == "7.0" ? "redis7" : (var.cache_engine_version == "6.x" ? "redis6.x" : "redis5.0") # Adjust based on version

  # Example parameter:
  # parameter {
  #   name  = "maxmemory-policy"
  #   value = "allkeys-lru"
  # }

  tags = local.tags
}

# REQ-8-008: Scalable backend cache
# REQ-8-025: Multi-AZ for Redis for DR (when automatic_failover_enabled or cluster_mode_enabled)
resource "aws_elasticache_replication_group" "redis_replication_group" {
  replication_group_id          = local.replication_group_id
  description                   = "ElastiCache Redis cluster for ${local.project_name}-${local.environment}"
  node_type                     = var.cache_node_type
  engine                        = "redis"
  engine_version                = var.cache_engine_version
  port                          = var.port
  parameter_group_name          = aws_elasticache_parameter_group.redis_param_group.name
  subnet_group_name             = aws_elasticache_subnet_group.redis_subnet_group.name
  security_group_ids            = [aws_security_group.redis_sg.id]
  automatic_failover_enabled    = var.cluster_mode_enabled ? null : var.automatic_failover_enabled # Multi-AZ for non-clustered
  multi_az_enabled              = var.cluster_mode_enabled ? null : var.multi_az_enabled # alias for automatic_failover_enabled

  # Cluster mode specific settings (REQ-8-008 for scalability)
  num_node_groups             = var.cluster_mode_enabled ? var.num_node_groups : null
  replicas_per_node_group     = var.cluster_mode_enabled ? var.replicas_per_node_group : null
  # For non-clustered (single shard) with replicas:
  num_cache_clusters          = var.cluster_mode_enabled ? null : (var.automatic_failover_enabled ? var.num_cache_clusters_non_clustered : 1)


  at_rest_encryption_enabled    = var.at_rest_encryption_enabled
  transit_encryption_enabled    = var.transit_encryption_enabled
  # kms_key_id                    = var.kms_key_id # If using customer managed KMS key for encryption

  snapshot_retention_limit      = var.snapshot_retention_limit # 0 to disable backups
  snapshot_window               = var.snapshot_window          # e.g., "03:00-05:00"

  maintenance_window            = var.maintenance_window       # e.g., "sun:05:00-sun:09:00"
  
  # data_tiering_enabled          = var.data_tiering_enabled # For r6gd nodes

  tags = local.tags

  lifecycle {
    ignore_changes = [
      #num_cache_clusters, # Can be changed by AWS auto scaling or other operations if not managed carefully
    ]
  }
}