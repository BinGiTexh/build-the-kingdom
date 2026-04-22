#!/bin/bash
set -e

LOG_FILE="/var/log/${project_name}-bootstrap.log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "[$(date)] Starting ${project_name} bootstrap"

if ! command -v aws &> /dev/null; then
    echo "Installing AWS CLI..."
    apt-get update -y
    apt-get install -y awscli
fi

mkdir -p /opt/${project_name}-init
cd /opt/${project_name}-init

echo "Downloading initialization script from S3..."
aws s3 cp s3://${s3_bucket}/${s3_key} ./init.sh

chmod +x ./init.sh

echo "Executing main initialization script..."
export ENVIRONMENT="${environment}"
export PROJECT_NAME="${project_name}"
export DB_PASSWORD="${db_password}"
export JWT_SECRET="${jwt_secret}"
export GITHUB_REPO="${github_repo}"
export GITHUB_BRANCH="${github_branch}"
export DOMAIN="${domain}"
export CLOUDFLARE_TUNNEL_ID="${cloudflare_tunnel_id}"
export CLOUDFLARE_TUNNEL_SECRET="${cloudflare_tunnel_secret}"
export CLOUDFLARE_ACCOUNT_TAG="${cloudflare_account_tag}"
export CLOUDFLARE_TUNNEL_TOKEN="${cloudflare_tunnel_token}"
export SITE_NAME="${site_name}"
export SITE_TAGLINE="${site_tagline}"
export PRIMARY_COLOR="${primary_color}"
export SECONDARY_COLOR="${secondary_color}"

./init.sh

echo "[$(date)] Bootstrap completed successfully"
