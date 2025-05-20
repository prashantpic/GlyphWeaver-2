# --- modules/caching_redis/variables.tf ---
# Purpose: Define input variables for the Redis module.

variable "project_name" {
  description = "The name of the project, used for tagging and naming resources."
  type        = string
}

variable "environment" {
  description = "The deployment environment (e.g., dev, staging, prod)."
  type        = string
}

variable "tags" {
  description = "A map of tags to assign to the resources."
  type        = map(string)
  default     = {}
}

variable "vpc_id" {
  description = "ID of the VPC where the ElastiCache cluster will be deployed."
  type        = string
}

variable "subnet_ids" {
  description = "List of private subnet IDs for the ElastiCache subnet group."
  type        = list(string)
}

variable "allowed_cidr_blocks" {
  description = "List of CIDR blocks allowed to connect to Redis. Typically VPC CIDR or specific application SG."
  type        = list(string)
  default     = ["0.0.0.0/0"] # WARNING: Overly permissive default. Should be restricted.
}

# variable "application_security_group_id" {
#   description = "Security group ID of the application that needs to access Redis. Preferred over CIDR blocks."
#   type        = string
#   default     = null
# }

variable "cache_node_type" {
  description = "The compute and memory capacity of the nodes in the Redis cluster (e.g., cache.t3.micro)."
  type        = string
}

variable "cache_engine_version" {
  description = "The version number of the Redis engine to be used (e.g., \"6.x\", \"7.0\")."
  type        = string
  default     = "7.0"
}

variable "port" {
  description = "The port number on which ElastiCache will accept connections."
  type        = number
  default     = 6379
}

variable "cluster_mode_enabled" {
  description = "Specifies whether a read-only replica is automatically promoted to primary role if the primary fails. If true, num_cache_clusters must be greater than 1. Ignored if cluster_mode_enabled is true."
  type        = bool
  default     = false # Creates a single shard replication group by default
}

# For Cluster Mode Enabled = true
variable "num_node_groups" {
  description = "Number of node groups (shards) for a Redis (cluster mode enabled) cluster. Required if cluster_mode_enabled is true."
  type        = number
  default     = 1 # Default for cluster mode implies 1 shard. Set to >1 for actual sharding.
}

variable "replicas_per_node_group" {
  description = "Number of replica nodes in each node group. Valid values are 0 to 5. Required if cluster_mode_enabled is true."
  type        = number
  default     = 1 # Default for HA in cluster mode.
}

# For Cluster Mode Disabled (single shard replication group)
variable "automatic_failover_enabled" {
  description = "Specifies whether a read-only replica is automatically promoted to primary role if the primary fails. Ignored if cluster_mode_enabled is true."
  type        = bool
  default     = false # For dev, can be false. For prod, should be true.
}

variable "multi_az_enabled" {
  description = "Specifies whether Multi-AZ support is enabled for a non-clustered Redis replication group. Ignored if cluster_mode_enabled is true."
  type        = bool
  default     = false # For dev, can be false. For prod, should be true.
}

variable "num_cache_clusters_non_clustered" {
  description = "The number of cache clusters (nodes) in this replication group when cluster_mode_enabled is false. If automatic_failover_enabled is true, must be at least 2."
  type        = number
  default     = 1 # If automatic_failover_enabled is true, this needs to be >=2
}


variable "at_rest_encryption_enabled" {
  description = "Whether to enable encryption at rest."
  type        = bool
  default     = true
}

variable "transit_encryption_enabled" {
  description = "Whether to enable encryption in transit."
  type        = bool
  default     = true
}

# variable "kms_key_id" {
#   description = "The ARN of the KMS key used to encrypt data at rest, if at_rest_encryption_enabled is true and using CMK."
#   type        = string
#   default     = null
# }

variable "snapshot_retention_limit" {
  description = "The number of days for which ElastiCache will retain automatic snapshots before deleting them. 0 to disable."
  type        = number
  default     = 7 # For production, consider longer retention or specific backup strategy
}

variable "snapshot_window" {
  description = "The daily time range (in UTC) during which ElastiCache will begin taking a daily snapshot of your node group (e.g., \"03:00-05:00\")."
  type        = string
  default     = "03:00-05:00" # Example window
}

variable "maintenance_window" {
  description = "Specifies the weekly time range for system maintenance. e.g. \"sun:05:00-sun:09:00\""
  type        = string
  default     = "sun:05:00-sun:09:00" # Example window
}

# variable "data_tiering_enabled" {
#   description = "Enables data tiering. Applicable only for R6gd node types. Default is false."
#   type        = bool
#   default     = false
# }