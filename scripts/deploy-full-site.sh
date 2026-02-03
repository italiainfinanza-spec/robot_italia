#!/bin/bash
# deploy-full-site.sh - Deploy main website + admin dashboard

VERCEL_TOKEN="${VERCEL_TOKEN:-PM85WRIJkOGL9CW68rz58K8J}"

echo "🚀 Deploying Robotica Weekly + Admin Dashboard..."

cd /home/ubuntu/.openclaw/workspace/newsletter/website

# Create a JSON file list for Vercel API
echo "📦 Packaging files..."

# Build file list
FILES='['
FIRST=true

for file in $(find . -type f); do
    if [ "$FIRST" = true ]; then
        FIRST=false
    else
        FILES+=","
    fi
    
    # Get base64 encoded content
    CONTENT=$(base64 -w 0 "$file")
    
    FILES+="{\"file\":\"${file#./}\",\"data\":\"$CONTENT\",\"encoding\":\"base64\"}"
done

FILES+=']'

# Create deployment payload
echo "$FILES" > /tmp/deploy-payload.json

# Deploy
echo "📤 Uploading to Vercel..."
curl -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d @/tmp/deploy-payload.json

echo ""
echo "✅ Deployment initiated!"
