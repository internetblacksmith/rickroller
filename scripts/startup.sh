#!/bin/bash

# Startup script to ensure rickroller stays running

# Install PM2 globally if not already installed
which pm2 > /dev/null || npm install -g pm2

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to restart on system reboot
pm2 startup

echo "✅ Rickroller is configured to start automatically"
echo "📌 If this is your first time, follow the command above to enable auto-start on boot"