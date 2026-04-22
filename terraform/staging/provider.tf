provider "aws" {
  region                   = var.aws_region
  shared_config_files      = ["$HOME/.aws/config"]
  shared_credentials_files = ["$HOME/.aws/credentials"]
  profile                  = var.aws_profile

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      Terraform   = "true"
    }
  }
}
