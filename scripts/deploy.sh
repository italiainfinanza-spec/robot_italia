#!/bin/bash
# deploy.sh - Deploy website to Vercel
# Usage: ./deploy.sh

set -e

echo "🚀 Deploying Robotica Weekly to Vercel..."

# Check for Vercel token
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Error: VERCEL_TOKEN not set"
    echo "Please set your Vercel token:"
    echo "  export VERCEL_TOKEN=your_token_here"
    exit 1
fi

# Navigate to website directory
cd /home/ubuntu/.openclaw/workspace/newsletter/website

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy
echo "📤 Deploying..."
vercel --token "$VERCEL_TOKEN" --yes --prod

echo "✅ Deployment complete!"
echo "🌐 Your site is live at: https://robotica-weekly.vercel.app"
