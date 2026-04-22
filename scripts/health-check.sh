#!/bin/bash

echo "Performing health check on job platform services..."

# Check Docker services
echo -n "Checking Docker services... "
if ! docker compose ps | grep -q "Up"; then
    echo "ERROR: Docker services are not running"
    echo "Run 'docker compose up -d' to start services"
    exit 1
else
    echo "OK"
fi

# Check PostgreSQL
echo -n "Checking PostgreSQL connection... "
if ! docker compose exec postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "ERROR: Cannot connect to PostgreSQL"
    echo "Check PostgreSQL logs: docker compose logs postgres"
    exit 1
else
    echo "OK"
fi

# Check API service
echo -n "Checking API health... "
if ! curl -s http://localhost:5000/health > /dev/null; then
    echo "ERROR: API service is not responding"
    echo "Check API logs: docker compose logs api"
    exit 1
else
    echo "OK"
fi

# Check Frontend service
echo -n "Checking Frontend service... "
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "ERROR: Frontend service is not responding"
    echo "Check Frontend logs: docker compose logs frontend"
    exit 1
else
    echo "OK"
fi

# Check environment configuration
echo -n "Checking environment configuration... "
if [ ! -f .env ]; then
    echo "ERROR: .env file not found"
    echo "Run setup script or copy .env.example to .env"
    exit 1
else
    echo "OK"
fi

# Check for required configurations
echo -n "Checking required configurations... "
REQUIRED_VARS=("REGION" "CURRENCY" "TIMEZONE" "DATABASE_URL" "JWT_SECRET")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" .env; then
        MISSING_VARS+=($var)
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "ERROR: Missing required configurations:"
    printf '%s\n' "${MISSING_VARS[@]}"
    exit 1
else
    echo "OK"
fi

# Print system information
echo -e "\nSystem Information:"
echo "-------------------"
echo "Docker version: $(docker --version)"
echo "Node.js version: $(docker compose exec api node --version)"
echo "PostgreSQL version: $(docker compose exec postgres postgres --version | head -n1)"
echo "Region: $(grep REGION .env | cut -d '=' -f2)"
echo "API URL: http://localhost:5000"
echo "Frontend URL: http://localhost:3000"

echo -e "\nAll checks passed! The job platform is running correctly."

