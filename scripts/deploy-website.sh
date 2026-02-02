#!/bin/bash
# deploy-website.sh - Deploy website to Vercel correctly

set -e

echo "🚀 Deploying Robotica Weekly Website..."

# Check for token
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Error: VERCEL_TOKEN not set"
    exit 1
fi

# Navigate to website directory
cd /home/ubuntu/.openclaw/workspace/newsletter/website

# Create package.json for Vercel
cat > package.json << 'EOF'
{
  "name": "robotica-weekly",
  "version": "1.0.0",
  "scripts": {
    "build": "echo 'Static site - no build needed'"
  }
}
EOF

# Deploy using Vercel API with correct file handling
echo "📤 Uploading files..."

# Create a deployment
curl -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"robotica-weekly\",
    \"files\": [
      {
        \"file\": \"index.html\",
        \"data\": \"$(cat index.html | base64 -w 0)\",
        \"encoding\": \"base64\"
      },
      {
        \"file\": \"package.json\",
        \"data\": \"$(cat package.json | base64 -w 0)\",
        \"encoding\": \"base64\"
      }
    ],
    \"projectSettings\": {
      \"framework\": null,
      \"buildCommand\": null,
      \"outputDirectory\": \".\"
    },
    \"target\": \"production\"
  }"

echo ""
echo "✅ Deployment initiated!"
