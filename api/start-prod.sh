#!/bin/sh

# Generate Prisma client for the current platform
echo "Generating Prisma client..."
npx prisma generate

# Start the production application
echo "Starting API server in production mode..."
npm run start:prod
