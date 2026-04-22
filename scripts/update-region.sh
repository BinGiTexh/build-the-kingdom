#!/bin/bash

# Check if required arguments are provided
if [ "$#" -lt 2 ]; then
    echo "Usage: $0 REGION_SLUG FIELD VALUE"
    echo "Example: $0 caribbean currency USD"
    exit 1
fi

REGION_SLUG=$1
FIELD=$2
VALUE=$3

# Update configuration files
case $FIELD in
    "currency")
        sed -i "s/\"currency\": \"[^\"]*\"/\"currency\": \"$VALUE\"/" packages/api/config/$REGION_SLUG.json
        sed -i "s/currency: '[^']*'/currency: '$VALUE'/" packages/frontend/src/config/$REGION_SLUG.js
        ;;
    "timezone")
        sed -i "s/\"timezone\": \"[^\"]*\"/\"timezone\": \"$VALUE\"/" packages/api/config/$REGION_SLUG.json
        sed -i "s/timezone: '[^']*'/timezone: '$VALUE'/" packages/frontend/src/config/$REGION_SLUG.js
        ;;
    "language")
        sed -i "s/\"locales\": \[[^]]*\]/\"locales\": [\"$VALUE\"]/" packages/api/config/$REGION_SLUG.json
        sed -i "s/language: '[^']*'/language: '$VALUE'/" packages/frontend/src/config/$REGION_SLUG.js
        ;;
    *)
        echo "Unknown field: $FIELD"
        exit 1
        ;;
esac

echo "Updated $FIELD to $VALUE for region $REGION_SLUG"
echo "Please restart the application for changes to take effect"

