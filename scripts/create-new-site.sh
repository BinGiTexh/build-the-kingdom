#!/bin/bash
# =============================================================================
# create-new-site.sh - Fork the template and deploy to AWS
# =============================================================================
# Usage: ./scripts/create-new-site.sh <project-name> <github-org>
# Example: ./scripts/create-new-site.sh buildthekingdom BinGiTexh
#
# For the full automated workflow with branding options, use the Claude Code
# skill instead: /deploy-fork
# =============================================================================

set -e

if [ $# -lt 2 ]; then
    echo "Usage: $0 <project-name> <github-org>"
    echo "Example: $0 buildthekingdom BinGiTexh"
    exit 1
fi

PROJECT_NAME=$1
GITHUB_ORG=$2
FORK_DIR="$HOME/$PROJECT_NAME"
TEMPLATE_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Creating new site: $PROJECT_NAME"
echo "  Org: $GITHUB_ORG"
echo "  Dir: $FORK_DIR"
echo ""

# Preflight
command -v gh &>/dev/null || { echo "ERROR: gh CLI required (https://cli.github.com/)"; exit 1; }
command -v terraform &>/dev/null || { echo "ERROR: terraform required"; exit 1; }
gh auth status &>/dev/null || { echo "ERROR: run 'gh auth login' first"; exit 1; }

# Create GitHub repo
if gh repo view "$GITHUB_ORG/$PROJECT_NAME" &>/dev/null; then
    echo "Repo $GITHUB_ORG/$PROJECT_NAME already exists"
else
    gh repo create "$GITHUB_ORG/$PROJECT_NAME" --public --description "$PROJECT_NAME job board"
fi

# Copy template
if [ -d "$FORK_DIR/.git" ]; then
    echo "Fork dir already exists at $FORK_DIR"
else
    mkdir -p "$FORK_DIR"
    cd "$TEMPLATE_DIR"
    git archive HEAD | tar -x -C "$FORK_DIR"
    cd "$FORK_DIR"
    git init
    git remote add origin "https://github.com/$GITHUB_ORG/$PROJECT_NAME.git"
fi

cd "$FORK_DIR"

# Generate lock files for production Docker builds
if [ ! -f backend/package-lock.json ]; then
    echo "Generating backend package-lock.json..."
    (cd backend && npm install --package-lock-only)
fi
if [ ! -f packages/frontend/package-lock.json ]; then
    echo "Generating frontend package-lock.json..."
    (cd packages/frontend && npm install --package-lock-only)
fi

# Commit and push
git add -A
git commit -m "feat: initial fork from job-platform-template"
git branch -M main
git push -u origin main

echo ""
echo "Repository ready: https://github.com/$GITHUB_ORG/$PROJECT_NAME"
echo ""
echo "Next steps:"
echo "  1. cd $FORK_DIR/terraform/staging"
echo "  2. cp terraform.tfvars.example terraform.tfvars"
echo "  3. Edit terraform.tfvars with your config"
echo "  4. terraform init && terraform plan"
echo "  5. terraform apply"
echo ""
echo "Or use the Claude Code skill for full automation:"
echo "  /deploy-fork"
