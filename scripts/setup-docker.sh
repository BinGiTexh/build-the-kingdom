#!/bin/bash
set -e

# Create necessary directories if they don't exist
mkdir -p docker/development

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example"
    cp .env.example .env
fi

# Install dependencies for API
echo "Installing API dependencies..."
cd packages/api
npm install
cd ../..

# Install dependencies for frontend
echo "Installing frontend dependencies..."
cd packages/frontend
npm install
cd ../..

# Start the containers
echo "Starting Docker containers..."
docker-compose -f docker/development/docker-compose.yml up --build -d

echo "\nSetup complete! Services are starting up..."
echo "- Frontend: http://localhost:3001"
echo "- API: http://localhost:5001"
echo "- pgAdmin: http://localhost:5051"
echo "  - Credentials: see PGADMIN_EMAIL / PGADMIN_PASSWORD in .env"

echo "\nTo stop the services, run: docker-compose -f docker/development/docker-compose.yml down"
