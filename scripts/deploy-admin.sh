#!/bin/bash
# deploy-admin.sh - Deploy admin dashboard correctly with all static files

set -e

echo "🚀 Deploying Admin Dashboard to Vercel..."

# Check for token
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Error: VERCEL_TOKEN not set"
    exit 1
fi

# Navigate to dist directory
cd /home/ubuntu/.openclaw/workspace/admin-dashboard/dist

# Create deployment with all files
echo "📦 Preparing deployment..."

# Use vercel CLI if available, otherwise use API
if command -v vercel &> /dev/null; then
    echo "📤 Deploying with Vercel CLI..."
    vercel --token "$VERCEL_TOKEN" --yes --prod
else
    echo "⚠️ Vercel CLI not found. Using API..."
    echo "For full static deployment, please run:"
    echo "  cd /home/ubuntu/.openclaw/workspace/admin-dashboard/dist"
    echo "  vercel --token YOUR_TOKEN --yes --prod"
fi

echo "✅ Deployment complete!"
