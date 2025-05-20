# --- modules/database_mongodb_atlas/main.tf ---
# Purpose: Provisions MongoDB Atlas projects and clusters, configures backup policies (REQ-8-024),
# manages database users, and sets up IP access lists.
# Supports DR (REQ-8-025) through multi-region/replica set configurations and robust backups.

locals {
  project_name = var.project_name
  environment  = var.environment
  tags = merge(var.tags, { # Atlas provider might not support tags on all resources in the same way as AWS
    Terraform   = "true"
    Project     = local.project_name
    Environment = local.environment
    Module      = "database-mongodb-atlas"
  })
}

resource "mongodbatlas_project" "main" {
  name   = var.atlas_project_name
  org_id = var.atlas_org_id

  # Atlas specific project settings can be added here if needed
  # project_settings {
  #   is_collect_database_specifics_statistics_enabled = true
  #   is_data_explorer_enabled                         = true
  # }
}

resource "mongodbatlas_cluster" "main" {
  project_id   = mongodbatlas_project.main.id
  name         = var.cluster_name
  cluster_type = "REPLICASET" # Or SHARDED for sharded clusters

  # Provider Settings
  provider_name               = var.provider_name
  provider_instance_size_name = var.cluster_tier # e.g., M10, M30 for AWS
  provider_region_name        = var.provider_region_name

  # Replication and Sharding (REQ-8-025 for DR)
  num_shards         = var.num_shards # Typically 1 for replica sets
  replication_factor = var.replication_factor # Default 3 for standard HA/DR

  # Disk Size
  disk_size_gb = var.disk_size_gb

  # MongoDB Version
  mongo_db_major_version = var.mongodb_version

  # Backup (REQ-8-024, REQ-8-025)
  backup_enabled                        = var.backup_enabled # Enables Cloud Backups
  provider_backup_enabled               = var.provider_backup_enabled # Enables Cloud Provider Snapshots if desired
  pit_enabled                           = var.pit_enabled # Point-in-Time Recovery

  # Other settings
  auto_scaling_disk_gb_enabled = var.auto_scaling_disk_gb_enabled
  # auto_scaling_compute_enabled = var.auto_scaling_compute_enabled # Requires M10+
  # auto_scaling_compute_scale_down_enabled = var.auto_scaling_compute_scale_down_enabled

  # Apply Atlas tags if supported by the specific resource and provider version
  # labels = [
  #   for key, value in local.tags : {
  #     key   = key
  #     value = value
  #   }
  # ]

  # Ensure project exists before creating cluster
  depends_on = [mongodbatlas_project.main]
}

resource "mongodbatlas_database_user" "app_user" {
  username           = var.db_username
  password           = var.db_password
  project_id         = mongodbatlas_project.main.id
  auth_database_name = "admin" # Or specific database if user is scoped

  roles {
    role_name     = "readWriteAnyDatabase" # Or more specific roles
    database_name = "admin"                # Grants access to all databases
  }
  # Example for specific database access:
  # roles {
  #   role_name     = "readWrite"
  #   database_name = var.app_database_name
  # }

  # Apply Atlas tags if supported
  # labels = [
  #   for key, value in local.tags : {
  #     key   = key
  #     value = value
  #   }
  # ]
  depends_on = [mongodbatlas_cluster.main]
}

resource "mongodbatlas_project_ip_access_list" "main" {
  count      = length(var.ip_access_list_cidrs) > 0 ? length(var.ip_access_list_cidrs) : 0
  project_id = mongodbatlas_project.main.id
  cidr_block = var.ip_access_list_cidrs[count.index].cidr_block
  comment    = lookup(var.ip_access_list_cidrs[count.index], "comment", "Terraform Managed: ${var.ip_access_list_cidrs[count.index].cidr_block}")

  # For temporary access rule (e.g., current IP for initial setup)
  # delete_after_date = var.ip_access_list_cidrs[count.index].delete_after_date

  depends_on = [mongodbatlas_cluster.main]
}

# REQ-8-024: Implement automated daily database backups
# REQ-8-025: Implement disaster recovery plan (backups are crucial)
resource "mongodbatlas_cloud_backup_schedule" "main" {
  count      = var.backup_enabled ? 1 : 0
  project_id = mongodbatlas_project.main.id
  cluster_name = mongodbatlas_cluster.main.name

  # reference_hour_of_day    = var.backup_schedule_reference_hour # UTC hour
  # reference_minute_of_day  = var.backup_schedule_reference_minute # UTC minute
  # restore_window_days      = var.backup_schedule_restore_window_days # For PIT

  # Daily, Weekly, Monthly Policies (mimicking policies/mongodb_atlas_backup_policy.json)
  # This resource structures policies differently than the conceptual JSON.
  # It focuses on defining export buckets and copy settings if needed,
  # and retention via policy_item blocks.

  # For automated backups, policy_item_* define retention.
  # For scheduled snapshots, use `mongodbatlas_cloud_backup_snapshot`
  # For on-demand, use `mongodbatlas_cloud_provider_snapshot`

  # Example: Daily backup retained for X days
  policy_item_daily {
    frequency_type      = "daily"
    frequency_interval  = 1 # Every 1 day
    retention_unit      = var.daily_backup_retention_unit   # "days", "weeks", or "months"
    retention_value     = var.daily_backup_retention_value  # e.g., 30 for 30 days
  }

  # Example: Weekly backup retained for Y weeks (taken on a specific day)
  dynamic "policy_item_weekly" {
    for_each = var.enable_weekly_backups ? [1] : []
    content {
      frequency_type      = "weekly"
      frequency_interval  = var.weekly_backup_frequency_interval # e.g. 1 for every week, 2 for bi-weekly
      retention_unit      = var.weekly_backup_retention_unit
      retention_value     = var.weekly_backup_retention_value
    }
  }

  # Example: Monthly backup retained for Z months (taken on a specific day of the month)
  dynamic "policy_item_monthly" {
    for_each = var.enable_monthly_backups ? [1] : []
    content {
      frequency_type      = "monthly"
      frequency_interval  = var.monthly_backup_frequency_interval # e.g. 1 for every month
      retention_unit      = var.monthly_backup_retention_unit
      retention_value     = var.monthly_backup_retention_value
    }
  }
  
  # Point in Time continuous backups are configured at cluster level (pit_enabled)
  # The `restore_window_days` here is more for scheduled snapshots.
  # For Cloud Backups (what `backup_enabled = true` enables), PIT is implicitly part of it.

  auto_export_enabled = var.backup_auto_export_enabled
  dynamic "export" {
    for_each = var.backup_auto_export_enabled ? [1] : []
    content {
      export_bucket_id = var.backup_export_bucket_id # ID of the S3 bucket for export
      frequency_type   = "daily" # Or as needed
    }
  }

  # Ensure cluster exists and backup is enabled on it
  depends_on = [mongodbatlas_cluster.main]
}

# REQ-8-025: For DR testing, you might want to define a restore job.
# This is typically an operational task, not a continuously provisioned resource.
# resource "mongodbatlas_cloud_backup_snapshot_restore_job" "test_restore" {
#   count = var.enable_dr_test_restore ? 1 : 0
#   project_id = mongodbatlas_project.main.id
#   cluster_name = mongodbatlas_cluster.main.name # Target cluster for restore (can be a new temp cluster)
#
#   # Either specify snapshot_id OR (timestamp + op_type) for PIT
#   # snapshot_id = "..." # ID of a specific snapshot to restore
#
#   # For PIT restore:
#   # delivery_type_config {
#   #   point_in_time_utc_seconds = 1625097600 # Example timestamp
#   #   point_in_time_type = "POINT_IN_TIME"
#   # }
#
#   # delivery_type needs to be "automated", "download", or "pointInTime"
#   # For restoring to a new cluster (automated):
#   delivery_type = {
#     automated = true
#     target_cluster_name = "${var.cluster_name}-dr-restored"
#     target_project_id = mongodbatlas_project.main.id
#   }
# }