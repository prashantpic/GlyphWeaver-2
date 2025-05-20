provider "aws" {
  region              = var.aws_region
  allowed_account_ids = ["123456789012"] # Placeholder - Replace with actual account IDs or manage via configuration

  default_tags {
    tags = var.default_tags
  }
}

provider "mongodbatlas" {
  public_key  = var.atlas_public_key
  private_key = var.atlas_private_key
}