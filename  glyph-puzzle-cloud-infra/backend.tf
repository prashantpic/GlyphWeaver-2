terraform {
  backend "s3" {
    bucket         = "your-terraform-state-bucket-name" # To be configured via -backend-config or wrapper script
    key            = "glyph-puzzle-cloud-infra/terraform.tfstate"
    region         = "your-aws-region-for-tf-state" # To be configured via -backend-config or wrapper script
    dynamodb_table = "glyph-puzzle-terraform-locks" # To be configured via -backend-config or wrapper script
    encrypt        = true
  }
}