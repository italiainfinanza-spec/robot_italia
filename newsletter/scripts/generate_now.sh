#!/bin/bash
# ============================================================================
# Manual Newsletter Generator Trigger
# Use this to manually generate a newsletter outside the cron schedule
# ============================================================================

set -e

NEWSLETTER_DIR="/home/ubuntu/.openclaw/workspace/newsletter"
SCRIPTS_DIR="$NEWSLETTER_DIR/scripts"
LOGS_DIR="$NEWSLETTER_DIR/logs"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Manual Newsletter Generator${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Ensure directories exist
mkdir -p "$LOGS_DIR"
mkdir -p "$NEWSLETTER_DIR/drafts"

# Set PYTHONPATH
export PYTHONPATH=/home/ubuntu/.openclaw:$PYTHONPATH

echo -e "${YELLOW}Starting newsletter generation...${NC}"
echo ""

# Run the generator
cd "$SCRIPTS_DIR"
python3 run_newsletter.py

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Newsletter generated successfully!${NC}"
    echo ""
    echo "Latest drafts:"
    ls -lt "$NEWSLETTER_DIR/drafts/"/*.txt 2>/dev/null | head -3 | awk '{print "  " $9 " (" $6, $7, $8 ")"}'
else
    echo -e "\033[0;31m✗ Newsletter generation failed (exit code: $EXIT_CODE)${NC}"
    echo "Check logs: $LOGS_DIR/runner_$(date +%Y%m%d).log"
fi

echo ""
