output "all_environment_details" {
  description = "A map containing key outputs from all managed environments. This will be populated as environments are deployed."
  value       = {
    # Example structure, to be filled by environment module outputs if this root module were to call them directly.
    # Or, this output might be used at a higher orchestration level if environments are separate Terraform workspaces.
    # For now, keeping it as a placeholder.
    # dev     = module.dev_environment.outputs
    # staging = module.staging_environment.outputs
    # prod    = module.prod_environment.outputs
  }
}

# Output details from the shared module
output "shared_resources_details" {
  description = "Details of the shared resources provisioned."
  value = {
    route53_zone_id               = module.shared.route53_zone_id
    route53_zone_name_servers     = module.shared.route53_zone_name_servers
    central_logging_bucket_arn    = module.shared.central_logging_bucket_arn
    central_logging_bucket_id     = module.shared.central_logging_bucket_id
    artifacts_bucket_arn          = module.shared.artifacts_bucket_arn
    artifacts_bucket_id           = module.shared.artifacts_bucket_id
    # cicd_iam_role_arn (if defined) = module.shared.cicd_iam_role_arn
  }
}