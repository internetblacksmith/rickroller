#!/bin/bash

# Deployment script for rickroller service

set -e

echo "🚀 Starting deployment..."

# Pull latest changes
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run health check
echo "🏥 Running health check..."
curl -f http://localhost:3000/health || echo "Health check failed, but continuing..."

# Restart with PM2
echo "🔄 Restarting application..."
pm2 reload ecosystem.config.js --update-env

# Save PM2 configuration
pm2 save

# Show status
echo "📊 Application status:"
pm2 status

echo "✅ Deployment complete!"