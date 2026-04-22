variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "aws_profile" {
  type    = string
  default = "personal"
}

variable "environment" {
  type    = string
  default = "staging"
}

variable "project_name" {
  type        = string
  description = "Short name for this site (used in resource naming, e.g. buildthekingdom)"
}

variable "instance_type" {
  type    = string
  default = "t3.medium"
}

variable "ec2_ami" {
  type        = string
  description = "Ubuntu 22.04 LTS AMI"
  default     = "ami-0fc5d935ebf8bc3bc"
}

variable "volume_size" {
  type    = number
  default = 30
}

variable "ssh_key_name" {
  type        = string
  description = "Name for the EC2 key pair"
}

variable "public_key_path" {
  type        = string
  description = "Path to the SSH public key file"
}

variable "admin_cidr" {
  type        = string
  description = "CIDR block for SSH access"
  default     = "0.0.0.0/0"
}

variable "vpc_cidr" {
  type    = string
  default = "10.31.0.0/16"
}

variable "github_repo" {
  type        = string
  description = "GitHub repo to clone on the instance (e.g. BinGiTexh/build-the-kingdom)"
}

variable "github_branch" {
  type    = string
  default = "main"
}

variable "domain" {
  type        = string
  description = "Primary domain for this site (e.g. buildthekingdom.com)"
}

variable "cloudflare_tunnel_id" {
  type = string
}

variable "cloudflare_tunnel_secret" {
  type      = string
  sensitive = true
}

variable "cloudflare_tunnel_token" {
  type      = string
  sensitive = true
}

variable "cloudflare_account_tag" {
  type = string
}

variable "site_name" {
  type    = string
  default = "Build The Kingdom"
}

variable "site_tagline" {
  type    = string
  default = "Building Careers, Building Community"
}

variable "primary_color" {
  type    = string
  default = "#2563EB"
}

variable "secondary_color" {
  type    = string
  default = "#10B981"
}

variable "tags" {
  type    = map(string)
  default = {}
}
