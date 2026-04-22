#!/bin/bash

# Script to customize the platform for a specific region
REGION=$1
CURRENCY=$2
TIMEZONE=$3
LANGUAGE=$4

# Validate input parameters
if [ -z "$REGION" ] || [ -z "$CURRENCY" ] || [ -z "$TIMEZONE" ] || [ -z "$LANGUAGE" ]; then
    echo "Usage: $0 REGION CURRENCY TIMEZONE LANGUAGE"
    echo "Example: $0 \"Caribbean\" \"JMD\" \"America/Kingston\" \"en\""
    exit 1
fi

# Create necessary directories if they don't exist
mkdir -p packages/api/config
mkdir -p packages/frontend/src/config

# Create region-specific configuration
cat > packages/api/config/${REGION}.json << EOF
{
  "region": {
    "name": "${REGION}",
    "currency": "${CURRENCY}",
    "timezone": "${TIMEZONE}",
    "locales": ["${LANGUAGE}"],
    "jobTypes": [
      "FULL_TIME",
      "PART_TIME",
      "CONTRACT",
      "INTERNSHIP"
    ]
  }
}
EOF

# Create region-specific frontend customization
cat > packages/frontend/src/config/${REGION}.js << EOF
export const regionConfig = {
  name: '${REGION}',
  currency: '${CURRENCY}',
  timezone: '${TIMEZONE}',
  language: '${LANGUAGE}',
  theme: {
    colors: {
      primary: '#2C5530',
      secondary: '#FFD700'
    }
  }
};
EOF

echo "Region ${REGION} configuration created successfully"

# Make the script executable
chmod +x scripts/customize-region.sh

