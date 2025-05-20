# --- modules/networking/outputs.tf ---
# Purpose: Expose outputs from the networking module.

output "vpc_id" {
  description = "The ID of the VPC."
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "A list of IDs for the public subnets."
  value       = values(aws_subnet.public)[*].id
}

output "private_subnet_ids" {
  description = "A list of IDs for the private subnets."
  value       = values(aws_subnet.private)[*].id
}

output "nat_gateway_ips" {
  description = "A list of public IP addresses of the NAT Gateways. Empty if NAT gateway is disabled."
  value       = var.enable_nat_gateway ? aws_eip.nat[*].public_ip : []
}

output "default_security_group_id" {
  description = "The ID of the default security group for the VPC."
  value       = aws_vpc.main.default_security_group_id
}

output "availability_zones_used" {
  description = "The list of availability zones used for subnets."
  value       = var.availability_zones
}