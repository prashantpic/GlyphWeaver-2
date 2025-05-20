# --- modules/iap_gateway/outputs.tf ---
# Purpose: Expose outputs from the IAP Gateway module.

output "iap_gateway_api_id" {
  description = "The ID of the API Gateway API."
  value       = aws_apigatewayv2_api.main.id
}

output "iap_gateway_invoke_url" {
  description = "The invoke URL for the default stage of the API Gateway."
  value       = aws_apigatewayv2_stage.main.invoke_url
}

output "iap_gateway_api_endpoint" {
  description = "The API endpoint for the API Gateway."
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "iap_gateway_stage_name" {
  description = "The name of the API Gateway stage."
  value       = aws_apigatewayv2_stage.main.name
}

output "iap_gateway_custom_domain_endpoint" {
  description = "The API Gateway domain name of the custom domain. (e.g. d-123abc456.execute-api.us-east-1.amazonaws.com)."
  value       = var.custom_domain_name != null ? aws_apigatewayv2_domain_name.custom[0].apigw_domain_name : null
}

output "iap_gateway_custom_domain_target_domain_name" {
  description = "The target domain name of the custom domain name (for CNAME/ALIAS records)."
  value       = var.custom_domain_name != null ? aws_apigatewayv2_domain_name.custom[0].domain_name_configuration[0].target_domain_name : null
}

output "iap_gateway_custom_domain_hosted_zone_id" {
  description = "The hosted zone ID of the custom domain name (for Route53 ALIAS records)."
  value       = var.custom_domain_name != null ? aws_apigatewayv2_domain_name.custom[0].domain_name_configuration[0].hosted_zone_id : null
}