# --- modules/database_mongodb_atlas/outputs.tf ---
# Purpose: Expose outputs from the MongoDB Atlas module.

output "mongodb_atlas_cluster_id" {
  description = "The ID of the MongoDB Atlas cluster."
  value       = mongodbatlas_cluster.main.cluster_id
}

output "mongodb_atlas_project_id" {
  description = "The ID of the MongoDB Atlas project."
  value       = mongodbatlas_project.main.id
}

output "mongodb_atlas_cluster_connection_string_standard" {
  description = "Standard MongoDB connection string for the cluster. May contain credentials."
  value       = mongodbatlas_cluster.main.connection_strings[0].standard
  sensitive   = true
}

output "mongodb_atlas_cluster_connection_string_srv" {
  description = "SRV MongoDB connection string for the cluster. May contain credentials."
  value       = mongodbatlas_cluster.main.connection_strings[0].standard_srv
  sensitive   = true
}

output "mongodb_atlas_cluster_state_name" {
  description = "Current state of the cluster (e.g., IDLE, CREATING, UPDATING, DELETING)."
  value       = mongodbatlas_cluster.main.state_name
}

output "db_user_username" {
  description = "Username of the created database user."
  value       = mongodbatlas_database_user.app_user.username
}