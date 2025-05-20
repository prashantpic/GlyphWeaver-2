# --- modules/security/main.tf ---
# Purpose: Provisions security-related resources like Security Groups for various services,
# KMS keys for encryption at rest, and AWS WAF rules for web application protection.
# Contributes to REQ-8-008 (secure infrastructure), REQ-8-024 (encrypted backups), REQ-8-025 (secure DR).

locals {
  project_name = var.project_name
  environment  = var.environment
  tags = merge(var.tags, {
    Terraform   = "true"
    Project     = local.project_name
    Environment = local.environment
    Module      = "security"
  })
}

# Application Security Group (e.g., for ECS services, Lambda)
resource "aws_security_group" "app_sg" {
  name        = "${var.security_group_name_prefix}-app-sg-${local.environment}"
  description = "Security group for application layer (e.g., ECS, Lambda)"
  vpc_id      = var.vpc_id

  dynamic "ingress" {
    for_each = var.app_ingress_rules
    content {
      description      = lookup(ingress.value, "description", null)
      from_port        = ingress.value.from_port
      to_port          = ingress.value.to_port
      protocol         = ingress.value.protocol
      cidr_blocks      = lookup(ingress.value, "cidr_blocks", null)
      ipv6_cidr_blocks = lookup(ingress.value, "ipv6_cidr_blocks", null)
      security_groups  = lookup(ingress.value, "security_groups", null) # For ALB -> App SG
      prefix_list_ids  = lookup(ingress.value, "prefix_list_ids", null)
    }
  }

  dynamic "egress" {
    for_each = var.app_egress_rules
    content {
      description      = lookup(egress.value, "description", null)
      from_port        = egress.value.from_port
      to_port          = egress.value.to_port
      protocol         = egress.value.protocol
      cidr_blocks      = lookup(egress.value, "cidr_blocks", null)
      ipv6_cidr_blocks = lookup(egress.value, "ipv6_cidr_blocks", null)
      security_groups  = lookup(egress.value, "security_groups", null)
      prefix_list_ids  = lookup(egress.value, "prefix_list_ids", null)
    }
  }
  # Default Egress: Allow all outbound often okay, but can be restricted.
  # egress {
  #   from_port   = 0
  #   to_port     = 0
  #   protocol    = "-1"
  #   cidr_blocks = ["0.0.0.0/0"]
  # }

  tags = merge(local.tags, { Name = "${var.security_group_name_prefix}-app-sg-${local.environment}" })
}


# Note: db_security_group_id & cache_security_group_id from spec.
# MongoDB Atlas uses IP whitelists, not AWS SGs.
# Redis module creates its own SG. This module could create SGs for other DBs if used.
# For now, only app_sg is actively defined with rules.
# If a generic DB SG is needed for other services:
# resource "aws_security_group" "db_sg" {
#   count       = var.create_db_sg ? 1 : 0
#   name        = "${var.security_group_name_prefix}-db-sg-${local.environment}"
#   description = "Security group for database layer"
#   vpc_id      = var.vpc_id
#   tags        = merge(local.tags, { Name = "${var.security_group_name_prefix}-db-sg-${local.environment}" })
#   # Ingress rules would allow app_sg to connect on DB port
# }

# KMS Key for encryption (REQ-8-024 for DB backups, REQ-8-025 for DR resilience)
resource "aws_kms_key" "main_key" {
  description             = var.kms_key_description != "" ? var.kms_key_description : "KMS key for ${local.project_name}-${local.environment}"
  deletion_window_in_days = var.kms_key_deletion_window_in_days
  enable_key_rotation     = var.enable_kms_key_rotation
  policy                  = var.kms_key_policy_json # Define who can use/manage the key

  tags = merge(local.tags, { Name = var.kms_key_alias_name })
}

resource "aws_kms_alias" "main_key_alias" {
  name          = "alias/${var.kms_key_alias_name}-${local.environment}"
  target_key_id = aws_kms_key.main_key.key_id
}

# AWS WAFv2 for protecting public endpoints (e.g., ALB, API Gateway) (REQ-8-008 for secure services)
resource "aws_wafv2_web_acl" "main_waf" {
  count = var.enable_waf ? 1 : 0

  name        = var.waf_web_acl_name != "" ? var.waf_web_acl_name : "${local.project_name}-waf-${local.environment}"
  scope       = var.waf_scope # REGIONAL (for ALB, API GW v2) or CLOUDFRONT
  description = "WAF WebACL for ${local.project_name}-${local.environment}"

  default_action {
    allow {} # or block {}
  }

  # Example: Rate-based rule
  # rule {
  #   name     = "RateLimitHttpRequests"
  #   priority = 1
  #   action {
  #     block {} # or count {}
  #   }
  #   statement {
  #     rate_based_statement {
  #       limit              = var.waf_rate_limit_threshold # e.g., 2000 requests per 5 minutes
  #       aggregate_key_type = "IP"                         # or "FORWARDED_IP"
  #     }
  #   }
  #   visibility_config {
  #     cloudwatch_metrics_enabled = true
  #     metric_name                = "RateLimitHttpRequestsMetric"
  #     sampled_requests_enabled   = true
  #   }
  # }

  # Example: AWS Managed Rules
  # rule {
  #   name     = "AWSManagedRulesCommonRuleSet"
  #   priority = 10
  #   override_action {
  #     none {}
  #   }
  #   statement {
  #     managed_rule_group_statement {
  #       name        = "AWSManagedRulesCommonRuleSet"
  #       vendor_name = "AWS"
  #     }
  #   }
  #   visibility_config {
  #     cloudwatch_metrics_enabled = true
  #     metric_name                = "AWSManagedRulesCommonRuleSetMetric"
  #     sampled_requests_enabled   = true
  #   }
  # }

  dynamic "rule" {
    for_each = var.waf_rules
    content {
      name     = rule.value.name
      priority = rule.value.priority
      action {
        dynamic "allow" {
          for_each = lookup(rule.value.action, "allow", null) != null ? [1] : []
          content {}
        }
        dynamic "block" {
          for_each = lookup(rule.value.action, "block", null) != null ? [1] : []
          content {}
        }
        dynamic "count" {
          for_each = lookup(rule.value.action, "count", null) != null ? [1] : []
          content {}
        }
      }
      statement = rule.value.statement_json # Pass the full statement block as JSON encoded string or map
      visibility_config {
        cloudwatch_metrics_enabled = lookup(rule.value.visibility_config, "cloudwatch_metrics_enabled", true)
        metric_name                = lookup(rule.value.visibility_config, "metric_name", rule.value.name)
        sampled_requests_enabled   = lookup(rule.value.visibility_config, "sampled_requests_enabled", true)
      }
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = var.waf_web_acl_name != "" ? var.waf_web_acl_name : "${local.project_name}-waf-${local.environment}"
    sampled_requests_enabled   = true
  }

  tags = local.tags
}

# Associate WAF with a resource (e.g., ALB ARN or API Gateway ARN)
# This association is typically done in the module that creates the resource (e.g., compute_ecs for ALB).
# However, if waf_resource_arn is provided, it can be done here.
resource "aws_wafv2_web_acl_association" "main_waf_assoc" {
  count = var.enable_waf && var.waf_resource_arn != null ? 1 : 0

  resource_arn = var.waf_resource_arn
  web_acl_arn  = aws_wafv2_web_acl.main_waf[0].arn
}