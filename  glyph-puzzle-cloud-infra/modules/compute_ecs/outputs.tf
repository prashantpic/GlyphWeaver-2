# --- modules/compute_ecs/outputs.tf ---
# Purpose: Expose outputs from the ECS compute module.

output "app_load_balancer_dns_name" {
  description = "DNS name of the application load balancer."
  value       = aws_lb.app_lb.dns_name
}

output "app_load_balancer_arn" {
  description = "ARN of the application load balancer."
  value       = aws_lb.app_lb.arn
}

output "app_load_balancer_zone_id" {
  description = "Zone ID of the application load balancer (for Route53 alias records)."
  value       = aws_lb.app_lb.zone_id
}

output "app_target_group_arn" {
  description = "ARN of the application's target group."
  value       = aws_lb_target_group.app_tg.arn
}

output "ecs_service_name" {
  description = "Name of the ECS service."
  value       = aws_ecs_service.app_service.name
}

output "ecs_service_arn" {
  description = "ARN of the ECS service."
  value       = aws_ecs_service.app_service.id
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster."
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ARN of the ECS cluster."
  value       = aws_ecs_cluster.main.arn
}

output "task_definition_arn" {
  description = "ARN of the ECS task definition."
  value       = aws_ecs_task_definition.app_task.arn
}

output "cloudwatch_log_group_name" {
  description = "Name of the CloudWatch log group for the application."
  value       = aws_cloudwatch_log_group.app_logs.name
}