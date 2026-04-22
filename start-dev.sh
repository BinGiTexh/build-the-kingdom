#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

# Start the services
docker-compose -f docker/development/docker-compose.yml down
docker-compose -f docker/development/docker-compose.yml up --build -d
