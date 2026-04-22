#!/bin/bash
# =============================================================================
# create-new-site.sh - Fork the template for a new white-label site
# =============================================================================
# Usage: ./scripts/create-new-site.sh <site-name> <domain>
# Example: ./scripts/create-new-site.sh michaels-arb-site arbsite.com
# =============================================================================

set -e

# Check arguments
if [ $# -lt 2 ]; then
    echo "Usage: $0 <site-name> <domain>"
    echo "Example: $0 michaels-arb-site arbsite.com"
    exit 1
fi

SITE_NAME=$1
DOMAIN=$2
REPO_NAME="$SITE_NAME"

echo "🚀 Creating new site: $SITE_NAME"
echo "   Domain: $DOMAIN"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is required. Install it from https://cli.github.com/"
    exit 1
fi

# Check if logged in
if ! gh auth status &> /dev/null; then
    echo "❌ Please login to GitHub CLI: gh auth login"
    exit 1
fi

# Create new repo from template
echo "📦 Creating repository from template..."
gh repo create "BinGiTexh/$REPO_NAME" \
    --template BinGiTexh/job-platform-template \
    --private \
    --clone

cd "$REPO_NAME"

# Create site-specific .env
echo "📝 Creating site configuration..."
cat > .env << ENVFILE
# =============================================================================
# $SITE_NAME Configuration
# =============================================================================

# Site Identity
SITE_NAME=$SITE_NAME
SITE_DOMAIN=$DOMAIN

# Customize these
SITE_TAGLINE=Your Job Search Starts Here
PRIMARY_COLOR=#2563EB
SECONDARY_COLOR=#10B981

# Currency (change as needed)
CURRENCY=USD
CURRENCY_SYMBOL=\$

# Database (update for production)
DB_USER=postgres
DB_PASSWORD=$(openssl rand -base64 16)
DB_NAME=jobplatform
DATABASE_URL=postgresql://\${DB_USER}:\${DB_PASSWORD}@db:5432/\${DB_NAME}

# Auth
JWT_SECRET=$(openssl rand -base64 32)

# Stripe (add your keys)
STRIPE_ENABLED=false
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=

# Feed Ingestion
FEED_INGEST_ENABLED=true

# Frontend
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:5000
ENVFILE

# Create Terraform site config
echo "🏗️  Creating Terraform configuration..."
mkdir -p terraform/sites/$SITE_NAME

cat > terraform/sites/$SITE_NAME/main.tf << TFFILE
# =============================================================================
# $SITE_NAME - Terraform Configuration
# =============================================================================

terraform {
  backend "s3" {
    bucket         = "bingitech-tf-state"
    key            = "sites/$SITE_NAME/terraform.tfstate"
    region         = "ap-northeast-1"
    dynamodb_table = "bingitech-tf-locks"
    encrypt        = true
  }
}

module "site" {
  source = "../../modules/job-site"

  site_name   = "$SITE_NAME"
  domain      = "$DOMAIN"
  environment = "production"

  # Instance settings
  instance_type = "t3.small"
  volume_size   = 20
  key_name      = "bingitech-key"

  # GitHub
  github_repo   = "BinGiTexh/$REPO_NAME"
  github_branch = "main"

  # ECR (from bootstrap outputs)
  ecr_api_url      = var.ecr_api_url
  ecr_frontend_url = var.ecr_frontend_url

  # Secrets (from GitHub Secrets / SSM)
  db_password = var.db_password
  jwt_secret  = var.jwt_secret

  # SSH access
  ssh_allowed_ips = ["YOUR_IP/32"]

  # Site-specific config
  site_config = {
    SITE_NAME     = "$SITE_NAME"
    SITE_DOMAIN   = "$DOMAIN"
    CURRENCY      = "USD"
    STRIPE_ENABLED = "true"
  }
}

variable "ecr_api_url" {}
variable "ecr_frontend_url" {}
variable "db_password" { sensitive = true }
variable "jwt_secret" { sensitive = true }

output "site_ip" {
  value = module.site.public_ip
}

output "ssh_command" {
  value = module.site.ssh_command
}
TFFILE

cat > terraform/sites/$SITE_NAME/terraform.tfvars.example << TFVARS
# Copy to terraform.tfvars and fill in values
ecr_api_url      = "123456789.dkr.ecr.ap-northeast-1.amazonaws.com/job-platform/api"
ecr_frontend_url = "123456789.dkr.ecr.ap-northeast-1.amazonaws.com/job-platform/frontend"
db_password      = ""
jwt_secret       = ""
TFVARS

# Commit initial config
echo "📤 Committing configuration..."
git add .
git commit -m "Configure site: $SITE_NAME for $DOMAIN"
git push origin main

echo ""
echo "✅ Site created successfully!"
echo ""
echo "Next steps:"
echo "1. cd $REPO_NAME"
echo "2. Update .env with your settings"
echo "3. docker-compose up -d  # Test locally"
echo "4. ./scripts/test-local.sh  # Verify"
echo "5. Add GitHub Secrets for CI/CD"
echo "6. cd terraform/sites/$SITE_NAME && terraform init && terraform apply"
echo ""
echo "Repository: https://github.com/BinGiTexh/$REPO_NAME"
