#!/bin/bash

# Check if required arguments are provided
if [ "$#" -lt 4 ]; then
    echo "Usage: $0 REGION_NAME CURRENCY TIMEZONE LANGUAGE"
    echo "Example: $0 'Caribbean' 'JMD' 'America/Kingston' 'en'"
    exit 1
fi

REGION_NAME=$1
CURRENCY=$2
TIMEZONE=$3
LANGUAGE=$4

# Convert region name to slug for file names
REGION_SLUG=$(echo $REGION_NAME | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

echo "Setting up job platform for $REGION_NAME..."

# Create necessary directories
mkdir -p config
mkdir -p packages/api/config
mkdir -p packages/frontend/src/config

# Generate environment file
cat > .env << EOF
# Region Configuration
REGION=$REGION_SLUG
CURRENCY=$CURRENCY
LANGUAGE=$LANGUAGE
TIMEZONE=$TIMEZONE

# Database
DB_USER=postgres
DB_PASSWORD=$(openssl rand -base64 16)
DB_NAME=${REGION_SLUG}_jobs
DATABASE_URL=postgresql://\${DB_USER}:\${DB_PASSWORD}@postgres:5432/\${DB_NAME}

# JWT
JWT_SECRET=$(openssl rand -hex 32)

# API Configuration
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
EOF

# Create region-specific configuration
cat > packages/api/config/$REGION_SLUG.json << EOF
{
  "region": {
    "name": "$REGION_NAME",
    "currency": "$CURRENCY",
    "timezone": "$TIMEZONE",
    "locales": ["$LANGUAGE"],
    "jobTypes": [
      "FULL_TIME",
      "PART_TIME",
      "CONTRACT",
      "INTERNSHIP"
    ]
  },
  "features": {
    "quickApply": true,
    "resumeParser": true,
    "skillMatching": true,
    "salaryRanges": true
  }
}
EOF

# Create frontend region configuration
cat > packages/frontend/src/config/$REGION_SLUG.js << EOF
export const regionConfig = {
  name: '$REGION_NAME',
  currency: '$CURRENCY',
  timezone: '$TIMEZONE',
  language: '$LANGUAGE',
  theme: {
    colors: {
      primary: '#2C5530',
      secondary: '#FFD700'
    }
  }
};
EOF

# Initialize database
echo "Initializing database..."
docker compose down -v
docker compose up -d postgres
sleep 5  # Wait for postgres to start

# Run database migrations
echo "Running database migrations..."
cd packages/api
npx prisma migrate deploy
cd ../..

# Install dependencies
echo "Installing dependencies..."
npm install

# Start development environment
echo "Starting development environment..."
docker compose up -d

echo "Setup complete! Your job platform is now running at:"
echo "Frontend: http://localhost:3000"
echo "API: http://localhost:5000"
echo ""
echo "Admin credentials were generated in your .env file."
echo "Review .env for DB_PASSWORD and JWT_SECRET values."

