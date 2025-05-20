# --- modules/networking/main.tf ---
# Purpose: Provisions core networking resources like VPC, public and private subnets
# across multiple availability zones, route tables, NAT gateways, and Internet Gateway.
# Supports DR by enabling multi-AZ setup (REQ-8-025).
# Provides underlying network for scalable services (REQ-8-008).

locals {
  project_name = var.project_name
  environment  = var.environment
  tags = merge(var.tags, {
    Terraform   = "true"
    Project     = local.project_name
    Environment = local.environment
    Module      = "networking"
  })
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr_block
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge(local.tags, {
    Name = "${local.project_name}-vpc-${local.environment}"
  })
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(local.tags, {
    Name = "${local.project_name}-igw-${local.environment}"
  })
}

resource "aws_subnet" "public" {
  for_each          = { for idx, cidr in var.public_subnet_cidrs : idx => cidr }
  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value
  availability_zone = var.availability_zones[each.key % length(var.availability_zones)] # REQ-8-025: Multi-AZ

  map_public_ip_on_launch = true

  tags = merge(local.tags, {
    Name   = "${local.project_name}-public-subnet-${local.environment}-${each.key}"
    Tier   = "public"
    AZ_idx = each.key
  })
}

resource "aws_subnet" "private" {
  for_each          = { for idx, cidr in var.private_subnet_cidrs : idx => cidr }
  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value
  availability_zone = var.availability_zones[each.key % length(var.availability_zones)] # REQ-8-025: Multi-AZ

  tags = merge(local.tags, {
    Name   = "${local.project_name}-private-subnet-${local.environment}-${each.key}"
    Tier   = "private"
    AZ_idx = each.key
  })
}

resource "aws_eip" "nat" {
  count = var.enable_nat_gateway ? (var.single_nat_gateway ? 1 : length(var.availability_zones)) : 0 # REQ-8-025: Multi-AZ for NAT if not single
  domain = "vpc"

  tags = merge(local.tags, {
    Name = "${local.project_name}-nat-eip-${local.environment}-${count.index}"
  })
}

resource "aws_nat_gateway" "main" {
  count         = var.enable_nat_gateway ? (var.single_nat_gateway ? 1 : length(var.availability_zones)) : 0 # REQ-8-025: Multi-AZ for NAT if not single
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index % length(aws_subnet.public)].id # Place NAT in public subnets

  tags = merge(local.tags, {
    Name = "${local.project_name}-nat-gw-${local.environment}-${count.index}"
  })

  depends_on = [aws_internet_gateway.main]
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(local.tags, {
    Name = "${local.project_name}-public-rt-${local.environment}"
  })
}

resource "aws_route_table_association" "public" {
  for_each       = aws_subnet.public
  subnet_id      = each.value.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table" "private" {
  for_each = { for idx, subnet_id in values(aws_subnet.private)[*].id : idx => subnet_id }
  vpc_id   = aws_vpc.main.id

  dynamic "route" {
    for_each = var.enable_nat_gateway ? [1] : []
    content {
      cidr_block     = "0.0.0.0/0"
      nat_gateway_id = var.single_nat_gateway ? aws_nat_gateway.main[0].id : aws_nat_gateway.main[each.key % length(aws_nat_gateway.main)].id
    }
  }

  tags = merge(local.tags, {
    Name = "${local.project_name}-private-rt-${local.environment}-${each.key}"
    AZ_idx = each.key
  })
}

resource "aws_route_table_association" "private" {
  for_each       = aws_subnet.private
  subnet_id      = each.value.id
  route_table_id = aws_route_table.private[each.key].id
}

resource "aws_network_acl" "main" {
  vpc_id = aws_vpc.main.id

  # Default: Deny all ingress and egress. Add specific rules as needed.
  # For simplicity, we'll use default rules which allow all,
  # but in production, this should be more restrictive.
  subnet_ids = concat(values(aws_subnet.public)[*].id, values(aws_subnet.private)[*].id)

  tags = merge(local.tags, {
    Name = "${local.project_name}-nacl-${local.environment}"
  })
}

# Optional: VPC Flow Logs for monitoring and security analysis (REQ-8-008 for general ops, REQ-8-025 for DR investigation)
resource "aws_cloudwatch_log_group" "flow_logs" {
  count             = var.enable_flow_logs ? 1 : 0
  name              = "/aws/vpc-flow-logs/${local.project_name}-${local.environment}"
  retention_in_days = var.flow_log_retention_days

  tags = merge(local.tags, {
    Name = "${local.project_name}-flow-logs-group-${local.environment}"
  })
}

resource "aws_iam_role" "flow_logs_role" {
  count              = var.enable_flow_logs ? 1 : 0
  name               = "${local.project_name}-flow-logs-role-${local.environment}"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = {
          Service = "vpc-flow-logs.amazonaws.com"
        }
      }
    ]
  })
  tags = local.tags
}

resource "aws_iam_role_policy" "flow_logs_policy" {
  count = var.enable_flow_logs ? 1 : 0
  name  = "${local.project_name}-flow-logs-policy-${local.environment}"
  role  = aws_iam_role.flow_logs_role[0].id
  policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        Action    = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Effect   = "Allow"
        Resource = "*" # Can be restricted to the specific log group
      }
    ]
  })
}

resource "aws_flow_log" "main" {
  count           = var.enable_flow_logs ? 1 : 0
  iam_role_arn    = aws_iam_role.flow_logs_role[0].arn
  log_destination = aws_cloudwatch_log_group.flow_logs[0].arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.main.id

  tags = merge(local.tags, {
    Name = "${local.project_name}-vpc-flow-log-${local.environment}"
  })
  depends_on = [aws_iam_role_policy.flow_logs_policy[0]]
}