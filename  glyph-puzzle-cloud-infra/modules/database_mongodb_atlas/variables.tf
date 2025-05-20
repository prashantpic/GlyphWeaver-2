# --- modules/database_mongodb_atlas/variables.tf ---
# Purpose: Define input variables for the MongoDB Atlas module.

variable "project_name" {
  description = "The name of the project, used for tagging and naming resources."
  type        = string
}

variable "environment" {
  description = "The deployment environment (e.g., dev, staging, prod)."
  type        = string
}

variable "tags" {
  description = "A map of tags to assign to the resources (Atlas support varies)."
  type        = map(string)
  default     = {}
}

variable "atlas_org_id" {
  description = "MongoDB Atlas Organization ID."
  type        = string
}

variable "atlas_project_name" {
  description = "Desired name for the MongoDB Atlas project."
  type        = string
}

variable "cluster_name" {
  description = "Name of the MongoDB Atlas cluster."
  type        = string
}

variable "cluster_tier" {
  description = "Cluster tier (instance size) on the cloud provider (e.g., M10, M20, M30 for AWS)."
  type        = string
  default     = "M10" # Example default, choose appropriately
}

variable "provider_name" {
  description = "Cloud provider for the cluster (AWS, GCP, AZURE)."
  type        = string
  default     = "AWS"
}

variable "provider_region_name" {
  description = "Region for the cluster on the cloud provider (e.g., US_EAST_1 for AWS)."
  type        = string
}

variable "num_shards" {
  description = "Number of shards for the cluster. Set to 1 for replica sets."
  type        = number
  default     = 1
}

variable "replication_factor" {
  description = "Number of replicas for each shard. Minimum 3 for replica sets for HA."
  type        = number
  default     = 3 # REQ-8-025
}

variable "disk_size_gb" {
  description = "Disk size in GB for each data-bearing server in the cluster."
  type        = number
  default     = 10 # Smallest common default
}

variable "mongodb_version" {
  description = "Major version of MongoDB to run on the cluster (e.g., \"5.0\", \"6.0\")."
  type        = string
  default     = "6.0"
}

variable "auto_scaling_disk_gb_enabled" {
  description = "Flag to enable auto-scaling of disk size."
  type        = bool
  default     = true
}

# variable "auto_scaling_compute_enabled" {
#   description = "Flag to enable auto-scaling of compute (cluster tier). Requires M10+."
#   type        = bool
#   default     = false
# }

# variable "auto_scaling_compute_scale_down_enabled" {
#   description = "Flag to enable compute auto-scaling to scale down. Requires M10+."
#   type        = bool
#   default     = false
# }

variable "backup_enabled" {
  description = "Flag to enable cloud provider backups for the cluster (REQ-8-024)."
  type        = bool
  default     = true
}

variable "provider_backup_enabled" {
  description = "Flag to enable cloud provider snapshots (AWS EBS, etc.) alongside Atlas backups."
  type        = bool
  default     = false # Usually Atlas Cloud Backups are preferred
}

variable "pit_enabled" {
  description = "Flag to enable Point-In-Time Restionation for this cluster. Requires `backup_enabled = true`."
  type        = bool
  default     = true # REQ-8-025 (contributes to RPO)
}

variable "db_username" {
  description = "Username for the initial database user."
  type        = string
}

variable "db_password" {
  description = "Password for the initial database user."
  type        = string
  sensitive   = true
}

# variable "app_database_name" {
#   description = "Name of the application specific database, if user is to be scoped."
#   type        = string
#   default     = "admin" # Default to admin if not scoping user to a specific DB
# }

variable "ip_access_list_cidrs" {
  description = "List of maps, where each map defines an IP access list entry with 'cidr_block' and 'comment' keys. Optional 'delete_after_date'."
  type        = list(object({
    cidr_block        = string
    comment           = optional(string)
    delete_after_date = optional(string) # ISO 8601 date format
  }))
  default     = []
}

# Backup Schedule Variables (REQ-8-024, REQ-8-025)
# variable "backup_schedule_reference_hour" {
#   description = "UTC hour of day that backup snapshots should be taken."
#   type        = number
#   default     = 3 # e.g., 3 AM UTC
# }

# variable "backup_schedule_reference_minute" {
#   description = "UTC minute of hour that backup snapshots should be taken."
#   type        = number
#   default     = 0
# }

# variable "backup_schedule_restore_window_days" {
#   description = "Number of days of log data to keep for point-in-time restoration."
#   type        = number
#   default     = 7
# }

variable "daily_backup_retention_unit" {
  description = "Unit for daily backup retention ('days', 'weeks', 'months')."
  type        = string
  default     = "days"
}

variable "daily_backup_retention_value" {
  description = "Value for daily backup retention."
  type        = number
  default     = 30 # As per conceptual policy
}

variable "enable_weekly_backups" {
  description = "Flag to enable weekly backup policy item."
  type        = bool
  default     = true
}

variable "weekly_backup_frequency_interval" {
  description = "Frequency interval for weekly backups (e.g., 1 for every week)."
  type        = number
  default     = 1
}

variable "weekly_backup_retention_unit" {
  description = "Unit for weekly backup retention."
  type        = string
  default     = "weeks"
}

variable "weekly_backup_retention_value" {
  description = "Value for weekly backup retention."
  type        = number
  default     = 12 # As per conceptual policy (3 months)
}

variable "enable_monthly_backups" {
  description = "Flag to enable monthly backup policy item."
  type        = bool
  default     = true
}

variable "monthly_backup_frequency_interval" {
  description = "Frequency interval for monthly backups (e.g., 1 for every month)."
  type        = number
  default     = 1
}

variable "monthly_backup_retention_unit" {
  description = "Unit for monthly backup retention."
  type        = string
  default     = "months"
}

variable "monthly_backup_retention_value" {
  description = "Value for monthly backup retention."
  type        = number
  default     = 12 # As per conceptual policy (1 year)
}

variable "backup_auto_export_enabled" {
  description = "Flag to enable auto-export of snapshots to an S3 bucket."
  type        = bool
  default     = false # Requires export_bucket_id if true
}

variable "backup_export_bucket_id" {
  description = "ID of the S3 bucket in Atlas to export snapshots to. Required if backup_auto_export_enabled is true."
  type        = string
  default     = null
}

# variable "enable_dr_test_restore" {
#   description = "Flag to enable a test restore job. For testing purposes only."
#   type        = bool
#   default     = false
# }