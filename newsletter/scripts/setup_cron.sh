#!/bin/bash
# ============================================================================
# Newsletter Cron Setup Script
# Installs cron jobs for automated newsletter generation
# Schedule: Mondays and Thursdays at 9:00 AM UTC
# ============================================================================

set -e

NEWSLETTER_DIR="/home/ubuntu/.openclaw/workspace/newsletter"
SCRIPTS_DIR="$NEWSLETTER_DIR/scripts"
LOGS_DIR="$NEWSLETTER_DIR/logs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Newsletter Automation Cron Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if running from correct directory
if [ ! -f "$SCRIPTS_DIR/run_newsletter.py" ]; then
    echo -e "${RED}Error: run_newsletter.py not found in $SCRIPTS_DIR${NC}"
    echo "Please run this script from the newsletter directory."
    exit 1
fi

# Create log directory
mkdir -p "$LOGS_DIR"

# Set up Python path and environment
PYTHON_PATH="/usr/bin/python3"
if [ ! -f "$PYTHON_PATH" ]; then
    PYTHON_PATH="$(which python3)"
fi

echo -e "${YELLOW}Using Python: $PYTHON_PATH${NC}"
echo ""

# Build cron commands
# Monday 7:30 AM UTC (perfect for commute reading)
MONDAY_JOB="30 7 * * 1 cd $SCRIPTS_DIR && PYTHONPATH=/home/ubuntu/.openclaw:$PYTHON_PATH $PYTHON_PATH $SCRIPTS_DIR/run_newsletter.py >> $LOGS_DIR/cron_monday.log 2>&1"

# Thursday 7:30 AM UTC
THURSDAY_JOB="30 7 * * 4 cd $SCRIPTS_DIR && PYTHONPATH=/home/ubuntu/.openclaw:$PYTHONPATH $PYTHON_PATH $SCRIPTS_DIR/run_newsletter.py >> $LOGS_DIR/cron_thursday.log 2>&1"

# Create temporary cron file
echo -e "${YELLOW}Generating cron entries...${NC}"

# Get existing crontab (if any)
CRON_FILE="/tmp/newsletter_cron_$$"
crontab -l 2>/dev/null > "$CRON_FILE" || true

# Check if jobs already exist
if grep -q "run_newsletter.py" "$CRON_FILE" 2>/dev/null; then
    echo -e "${YELLOW}Newsletter cron jobs already exist. Updating...${NC}"
    # Remove old entries
    grep -v "run_newsletter.py" "$CRON_FILE" > "$CRON_FILE.tmp" || true
    mv "$CRON_FILE.tmp" "$CRON_FILE"
fi

# Add new entries
echo "# Newsletter Automation - Robotics Italian Newsletter" >> "$CRON_FILE"
echo "# Generated: $(date -Iseconds)" >> "$CRON_FILE"
echo "$MONDAY_JOB" >> "$CRON_FILE"
echo "$THURSDAY_JOB" >> "$CRON_FILE"
echo "" >> "$CRON_FILE"

# Install new crontab
echo -e "${YELLOW}Installing cron jobs...${NC}"
crontab "$CRON_FILE"
rm "$CRON_FILE"

echo -e "${GREEN}✓ Cron jobs installed successfully!${NC}"
echo ""
echo -e "${GREEN}Schedule:${NC}"
echo "  • Monday:    7:30 AM UTC (commute time!)"
echo "  • Thursday:  7:30 AM UTC (commute time!)"
echo ""
echo -e "${GREEN}Locations:${NC}"
echo "  • Script:    $SCRIPTS_DIR/run_newsletter.py"
echo "  • Drafts:    $NEWSLETTER_DIR/drafts/"
echo "  • Logs:      $LOGS_DIR/"
echo ""

# Display current crontab
echo -e "${YELLOW}Current cron jobs:${NC}"
crontab -l | grep -A5 "Newsletter Automation" || echo "  (No newsletter jobs found - installation may have failed)"
echo ""

# Make scripts executable
chmod +x "$SCRIPTS_DIR/run_newsletter.py"
chmod +x "$SCRIPTS_DIR/generate_newsletter.py"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "To test the newsletter generation manually, run:"
echo "  cd $SCRIPTS_DIR && python3 run_newsletter.py"
echo ""
echo "To view logs:"
echo "  tail -f $LOGS_DIR/runner_$(date +%Y%m%d).log"
echo ""
