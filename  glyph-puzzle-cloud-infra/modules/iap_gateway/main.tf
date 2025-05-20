# --- modules/iap_gateway/main.tf ---
# Purpose: Provisions infrastructure for the IAP Validator Gateway, such as AWS API Gateway (v2 HTTP)
# integrating with backend Lambda functions or ECS services (via ALB).
# Fulfills backend-platform-iap-validator-gateway component (REQ-8-008).

locals {
  project_name = var.project_name
  environment  = var.environment
  tags = merge(var.tags, {
    Terraform   = "true"
    Project     = local.project_name
    Environment = local.environment
    Module      = "iap-gateway"
    Component   = "backend-platform-iap-validator-gateway"
  })
}

resource "aws_apigatewayv2_api" "main" {
  name          = var.api_name != "" ? var.api_name : "${local.project_name}-iap-gw-${local.environment}"
  protocol_type = var.api_protocol_type # HTTP or WEBSOCKET

  # Optional: CORS configuration for HTTP APIs
  # cors_configuration {
  #   allow_origins = ["*"] # Be more specific in production
  #   allow_methods = ["GET", "POST", "OPTIONS"]
  #   allow_headers = ["Content-Type", "Authorization"]
  #   max_age       = 300
  # }

  tags = local.tags
}

resource "aws_apigatewayv2_integration" "main" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = var.integration_type # e.g., AWS_PROXY for Lambda, HTTP_PROXY for ALB/NLB

  # For AWS_PROXY (Lambda)
  integration_uri = var.integration_type == "AWS_PROXY" ? var.integration_uri : null # Lambda function ARN or alias ARN
  payload_format_version = var.integration_type == "AWS_PROXY" ? var.payload_format_version : null # "1.0" or "2.0"

  # For HTTP_PROXY (ALB/NLB/other HTTP endpoint)
  integration_method = var.integration_type == "HTTP_PROXY" ? var.integration_method : null # e.g. ANY, GET, POST
  connection_type    = var.integration_type == "HTTP_PROXY" ? "VPC_LINK" : null # if integration_uri is private
  connection_id      = var.integration_type == "HTTP_PROXY" && var.vpc_link_id != null ? var.vpc_link_id : null
  integration_uri    = var.integration_type == "HTTP_PROXY" ? var.integration_uri : null # HTTP endpoint URL (e.g. ALB listener ARN for private integration, or public URL)

  # timeout_milliseconds = var.integration_timeout

  # tls_config { # For HTTP_PROXY if target uses self-signed certs (not recommended for prod)
  #   server_name_to_verify = var.integration_tls_server_name
  # }
}

resource "aws_apigatewayv2_route" "default_route" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = var.route_key # e.g., "$default", "GET /items", "POST /submit"
  target    = "integrations/${aws_apigatewayv2_integration.main.id}"

  # Optional: Authorization
  # authorization_type = "JWT" # or "AWS_IAM", "CUSTOM"
  # authorizer_id      = var.authorizer_id
}

resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = var.stage_name # e.g., "$default", "v1", "dev"
  auto_deploy = true

  # Optional: Access logging
  # default_route_settings {
  #   detailed_metrics_enabled = true
  #   logging_level            = "INFO" # ERROR, INFO, or OFF
  #   data_trace_enabled       = true   # if logging_level is INFO
  # }
  # access_log_settings {
  #   destination_arn = var.access_log_group_arn # CloudWatch Log Group ARN
  #   format          = jsonencode({...}) # Define log format
  # }

  # Optional: Throttling
  # route_settings {
  #   route_key        = "$default" # or specific route key
  #   throttling_burst_limit = 100
  #   throttling_rate_limit  = 50
  # }

  tags = local.tags
}

# Optional: Custom Domain Name
resource "aws_apigatewayv2_domain_name" "custom" {
  count = var.custom_domain_name != null ? 1 : 0

  domain_name = var.custom_domain_name
  domain_name_configuration {
    certificate_arn = var.certificate_arn # ACM Certificate ARN
    endpoint_type   = "REGIONAL"          # or "EDGE"
    security_policy = "TLS_1_2"
  }
  tags = local.tags
}

resource "aws_apigatewayv2_api_mapping" "custom" {
  count = var.custom_domain_name != null ? 1 : 0

  api_id      = aws_apigatewayv2_api.main.id
  domain_name = aws_apigatewayv2_domain_name.custom[0].id
  stage       = aws_apigatewayv2_stage.main.id
  # api_mapping_key = var.api_mapping_key # Optional base path, e.g., "v1"
}

# REQ-8-008: Backend platform IAP validator gateway
# If integrating with Lambda, API Gateway needs permission to invoke it.
resource "aws_lambda_permission" "api_gw_lambda_invoke" {
  count = var.integration_type == "AWS_PROXY" && var.grant_lambda_invoke_permission ? 1 : 0

  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.integration_uri # Lambda function ARN
  principal     = "apigateway.amazonaws.com"

  # Source ARN to restrict permission to this specific API Gateway
  source_arn = "${aws_apigatewayv2_api.main.execution_arn}/*/*" # Allow any method on any path for this stage
  # More specific: "${aws_apigatewayv2_api.main.execution_arn}/${var.stage_name}/${var.integration_method_for_permission}/${var.integration_path_for_permission}"
}