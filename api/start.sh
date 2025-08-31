#!/bin/sh

# Generate Prisma client for the current platform
echo "Generating Prisma client..."
npx prisma generate

# Start the application
echo "Starting API server..."
npm run start:dev
