#!/bin/bash
# send_newsletter.sh - Send newsletter via SendGrid
# Usage: export SENDGRID_API_KEY=your_key && ./send_newsletter.sh

API_KEY="${SENDGRID_API_KEY}"
RECIPIENT="${RECIPIENT_EMAIL:-nadir.balena@gmail.com}"
SENDER="${SENDER_EMAIL:-nadir.balena@gmail.com}"
SUBJECT="${EMAIL_SUBJECT:-Figure AI: \$1B per costruire il futuro 🤖}"
HTML_FILE="${HTML_FILE:-/home/ubuntu/.openclaw/workspace/newsletter/emails/premium-edition-001.html}"

if [ -z "$API_KEY" ]; then
    echo "Error: SENDGRID_API_KEY not set"
    echo "Usage: export SENDGRID_API_KEY=your_key && ./send_newsletter.sh"
    exit 1
fi

# Read HTML content
HTML_CONTENT=$(cat "$HTML_FILE" | sed 's/"/\\"/g' | tr '\n' ' ')

# Create JSON payload
cat > /tmp/payload.json << EOF
{
  "personalizations": [{
    "to": [{"email": "$RECIPIENT"}]
  }],
  "from": {"email": "$SENDER", "name": "Robotica Weekly"},
  "subject": "$SUBJECT",
  "content": [{
    "type": "text/html",
    "value": "$HTML_CONTENT"
  }]
}
EOF

# Send email
curl -X POST "https://api.sendgrid.com/v3/mail/send" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d @/tmp/payload.json

echo ""
