#!/bin/bash
set -e

LOG_FILE="/var/log/$PROJECT_NAME-init.log"
exec > >(tee -a "$LOG_FILE") 2>&1

log() { echo "[$(date)] $1"; }
error_exit() { log "ERROR: $1"; exit 1; }

# -------------------------------------------------------------------
# System packages
# -------------------------------------------------------------------
log "Updating system packages..."
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

DEBIAN_FRONTEND=noninteractive apt-get install -y \
    apt-transport-https ca-certificates curl gnupg \
    lsb-release software-properties-common jq unzip

# -------------------------------------------------------------------
# Docker
# -------------------------------------------------------------------
log "Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io

log "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

# -------------------------------------------------------------------
# Cloudflare Tunnel credentials
# -------------------------------------------------------------------
log "Setting up Cloudflare Tunnel..."
mkdir -p /home/ubuntu/cloudflared
chown -R ubuntu:ubuntu /home/ubuntu/cloudflared

if [ -z "$CLOUDFLARE_TUNNEL_ID" ] || [ -z "$CLOUDFLARE_TUNNEL_SECRET" ] || [ -z "$CLOUDFLARE_ACCOUNT_TAG" ]; then
    log "Warning: Cloudflare tunnel credentials not provided. Skipping tunnel setup."
else
    cat > /home/ubuntu/cloudflared/credentials.json <<CRED_EOL
{
    "AccountTag": "$CLOUDFLARE_ACCOUNT_TAG",
    "TunnelSecret": "$CLOUDFLARE_TUNNEL_SECRET",
    "TunnelID": "$CLOUDFLARE_TUNNEL_ID",
    "Type": "cfd_tunnel"
}
CRED_EOL
    chmod 600 /home/ubuntu/cloudflared/credentials.json

    cat > /home/ubuntu/cloudflared/config.yml <<CFG_EOL
tunnel: $CLOUDFLARE_TUNNEL_ID
credentials-file: /etc/cloudflared/credentials.json
logfile: /var/log/cloudflared.log
loglevel: info

ingress:
  - hostname: $DOMAIN
    service: http://frontend:3080
    originRequest:
      noTLSVerify: true
  - hostname: api.$DOMAIN
    service: http://api:5000
    originRequest:
      noTLSVerify: true
  - service: http_status:404
CFG_EOL

    chown -R ubuntu:ubuntu /home/ubuntu/cloudflared
fi

# -------------------------------------------------------------------
# Clone repo and create .env
# -------------------------------------------------------------------
log "Cloning repository..."
mkdir -p /home/ubuntu/$PROJECT_NAME/{logs,data/{postgres,redis}}
cd /home/ubuntu

if [ ! -d "$PROJECT_NAME/.git" ]; then
    git clone -b "$GITHUB_BRANCH" "https://github.com/$GITHUB_REPO.git" "$PROJECT_NAME"
fi
chown -R ubuntu:ubuntu "$PROJECT_NAME"
cd /home/ubuntu/$PROJECT_NAME

log "Creating environment configuration..."
cat > .env <<ENV_EOL
NODE_ENV=production
PORT=5000
PROJECT_NAME=$PROJECT_NAME

# Database
DB_PASSWORD=$DB_PASSWORD
DB_NAME=jobplatform
DATABASE_URL=postgresql://postgres:$DB_PASSWORD@postgres:5432/jobplatform

# Auth
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://redis:6379

# Site Branding
SITE_NAME=$SITE_NAME
SITE_TAGLINE=$SITE_TAGLINE
SITE_DOMAIN=$DOMAIN
PRIMARY_COLOR=$PRIMARY_COLOR
SECONDARY_COLOR=$SECONDARY_COLOR

# Cloudflare
CLOUDFLARE_TUNNEL_TOKEN=$CLOUDFLARE_TUNNEL_TOKEN

# Stripe (disabled by default)
STRIPE_ENABLED=false

# Feed Ingestion
FEED_INGEST_ENABLED=true
ENV_EOL

# Set FRONTEND_URL based on whether domain is configured
# IMDSv2 requires a token for metadata queries
IMDS_TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" 2>/dev/null || true)
if [ -n "$IMDS_TOKEN" ]; then
    PUBLIC_IP=$(curl -s -H "X-aws-ec2-metadata-token: $IMDS_TOKEN" http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")
else
    PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")
fi
if [ -n "$DOMAIN" ]; then
    echo "FRONTEND_URL=https://$DOMAIN" >> .env
else
    echo "FRONTEND_URL=http://$PUBLIC_IP" >> .env
fi

chmod 600 .env
chown ubuntu:ubuntu .env

# -------------------------------------------------------------------
# Build and start services
# -------------------------------------------------------------------
COMPOSE_FILE="/home/ubuntu/$PROJECT_NAME/docker-compose.prod.yml"

COMPOSE_PROFILES=""
if [ -n "$CLOUDFLARE_TUNNEL_ID" ] && [ -n "$CLOUDFLARE_TUNNEL_SECRET" ]; then
    COMPOSE_PROFILES="--profile cloudflare"
    log "Cloudflare Tunnel enabled"
else
    log "No Cloudflare Tunnel — site will be accessible via public IP on port 80"
fi

build_services() {
    local max_retries=3
    local retry_count=0
    while [ $retry_count -lt $max_retries ]; do
        log "Building services (attempt $((retry_count + 1))/$max_retries)..."
        if sudo -u ubuntu bash -c "cd /home/ubuntu/$PROJECT_NAME && docker-compose -f $COMPOSE_FILE $COMPOSE_PROFILES build --no-cache"; then
            log "Services built successfully"
            return 0
        fi
        retry_count=$((retry_count + 1))
        [ $retry_count -lt $max_retries ] && sleep 10
    done
    error_exit "Failed to build services after $max_retries attempts"
}

start_services() {
    local max_retries=3
    local retry_count=0
    while [ $retry_count -lt $max_retries ]; do
        log "Starting services (attempt $((retry_count + 1))/$max_retries)..."
        if sudo -u ubuntu bash -c "cd /home/ubuntu/$PROJECT_NAME && docker-compose -f $COMPOSE_FILE $COMPOSE_PROFILES up -d"; then
            log "Services started successfully"
            return 0
        fi
        retry_count=$((retry_count + 1))
        [ $retry_count -lt $max_retries ] && { sudo -u ubuntu docker-compose -f $COMPOSE_FILE down || true; sleep 10; }
    done
    error_exit "Failed to start services after $max_retries attempts"
}

build_services
start_services

# -------------------------------------------------------------------
# Health checks
# -------------------------------------------------------------------
check_service_health() {
    local service=$1
    local max_retries=30
    local retry_count=0
    log "Checking health of service: $service"
    while [ $retry_count -lt $max_retries ]; do
        if sudo -u ubuntu docker-compose -f $COMPOSE_FILE ps "$service" 2>/dev/null | grep -q "healthy\|Up"; then
            log "Service $service is healthy"
            return 0
        fi
        retry_count=$((retry_count + 1))
        sleep 10
    done
    log "Warning: Service $service did not become healthy"
    return 1
}

check_service_health "postgres"
check_service_health "redis"
check_service_health "api"
check_service_health "frontend"

# -------------------------------------------------------------------
# Log rotation
# -------------------------------------------------------------------
cat > /etc/logrotate.d/docker-containers <<EOL
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  size=100M
  missingok
  delaycompress
  copytruncate
}
EOL

# -------------------------------------------------------------------
# Final status
# -------------------------------------------------------------------
log "=== Final service status ==="
sudo -u ubuntu docker-compose -f $COMPOSE_FILE ps

log "=== Deployment Summary ==="
log "Project:  $PROJECT_NAME"
log "Instance: $PUBLIC_IP"
if [ -n "$DOMAIN" ]; then
    log "Domain:   https://$DOMAIN"
else
    log "Site:     http://$PUBLIC_IP"
fi

log "Initialization complete!"
