#!/usr/bin/env python3
"""
Notification Module for Newsletter System
Sends alerts when drafts are ready via various channels.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

WORKSPACE_DIR = Path("/home/ubuntu/.openclaw/workspace/newsletter")
CONFIG_PATH = WORKSPACE_DIR / "config/notifications.json"

def log_notification(message: str):
    """Log notification to file"""
    log_dir = WORKSPACE_DIR / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    
    log_file = log_dir / f"notifications_{datetime.now().strftime('%Y%m')}.log"
    timestamp = datetime.now().isoformat()
    
    with open(log_file, 'a') as f:
        f.write(f"[{timestamp}] {message}\n")

def send_console_notification(draft_path: str, status: str = "ready"):
    """Print notification to console (for cron/system integration)"""
    notification = f"\n{'='*60}\n"
    notification += f"🤖 NEWSLETTER NOTIFICATION\n"
    notification += f"{'='*60}\n"
    notification += f"Status: {status.upper()}\n"
    notification += f"Draft: {draft_path}\n"
    notification += f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
    notification += f"{'='*60}\n"
    
    print(notification)
    log_notification(f"Status: {status}, Draft: {draft_path}")

def send_file_notification(draft_path: str):
    """Create a notification file that can be polled by external systems"""
    notify_dir = WORKSPACE_DIR / "notifications"
    notify_dir.mkdir(parents=True, exist_ok=True)
    
    notify_file = notify_dir / f"ready_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    notification = {
        "status": "ready",
        "draft_path": str(draft_path),
        "timestamp": datetime.now().isoformat(),
        "unix_timestamp": int(datetime.now().timestamp())
    }
    
    with open(notify_file, 'w') as f:
        json.dump(notification, f, indent=2)
    
    print(f"📬 Notification file created: {notify_file}")
    return notify_file

def notify(draft_path: str, status: str = "ready"):
    """
    Send all configured notifications
    
    Args:
        draft_path: Path to the generated draft
        status: 'ready', 'failed', or 'warning'
    """
    # Always send console notification
    send_console_notification(draft_path, status)
    
    # Create file notification for polling
    if status == "ready":
        send_file_notification(draft_path)
    
    # Load config for additional notifications
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH, 'r') as f:
            config = json.load(f)
        
        # Slack notification
        if config.get('slack', {}).get('enabled'):
            send_slack_notification(draft_path, status, config['slack'])
        
        # Discord notification
        if config.get('discord', {}).get('enabled'):
            send_discord_notification(draft_path, status, config['discord'])
        
        # Telegram notification
        if config.get('telegram', {}).get('enabled'):
            send_telegram_notification(draft_path, status, config['telegram'])

def send_slack_notification(draft_path: str, status: str, config: dict):
    """Send Slack webhook notification"""
    try:
        import requests
        
        emoji = "✅" if status == "ready" else "❌" if status == "failed" else "⚠️"
        
        payload = {
            "text": f"{emoji} Newsletter {status.upper()}",
            "attachments": [{
                "color": "good" if status == "ready" else "danger",
                "fields": [
                    {"title": "Status", "value": status, "short": True},
                    {"title": "Draft", "value": str(draft_path), "short": False},
                    {"title": "Time", "value": datetime.now().strftime('%Y-%m-%d %H:%M'), "short": True}
                ]
            }]
        }
        
        response = requests.post(config['webhook_url'], json=payload, timeout=10)
        if response.status_code == 200:
            print("📱 Slack notification sent")
        else:
            print(f"⚠️ Slack notification failed: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Slack error: {e}")

def send_discord_notification(draft_path: str, status: str, config: dict):
    """Send Discord webhook notification"""
    try:
        import requests
        
        emoji = "✅" if status == "ready" else "❌"
        color = 0x00ff00 if status == "ready" else 0xff0000
        
        payload = {
            "embeds": [{
                "title": f"{emoji} Newsletter Automation",
                "description": f"Newsletter draft is {status}",
                "color": color,
                "fields": [
                    {"name": "Draft Path", "value": str(draft_path), "inline": False},
                    {"name": "Generated", "value": datetime.now().strftime('%Y-%m-%d %H:%M UTC'), "inline": True}
                ],
                "timestamp": datetime.now().isoformat()
            }]
        }
        
        response = requests.post(config['webhook_url'], json=payload, timeout=10)
        if response.status_code == 204:
            print("📱 Discord notification sent")
    except Exception as e:
        print(f"⚠️ Discord error: {e}")

def send_telegram_notification(draft_path: str, status: str, config: dict):
    """Send Telegram bot notification"""
    try:
        import requests
        
        emoji = "✅" if status == "ready" else "❌"
        message = f"""
{emoji} <b>Newsletter {status.upper()}</b>

📄 Draft: <code>{draft_path}</code>
🕐 Time: {datetime.now().strftime('%Y-%m-%d %H:%M UTC')}
        """
        
        url = f"https://api.telegram.org/bot{config['bot_token']}/sendMessage"
        payload = {
            "chat_id": config['chat_id'],
            "text": message,
            "parse_mode": "HTML"
        }
        
        response = requests.post(url, json=payload, timeout=10)
        if response.json().get('ok'):
            print("📱 Telegram notification sent")
    except Exception as e:
        print(f"⚠️ Telegram error: {e}")

def check_pending_notifications():
    """Check for pending notification files (for external polling)"""
    notify_dir = WORKSPACE_DIR / "notifications"
    
    if not notify_dir.exists():
        return []
    
    pending = []
    for f in notify_dir.glob("ready_*.json"):
        with open(f, 'r') as file:
            pending.append(json.load(file))
    
    return pending

def clear_notifications():
    """Clear all pending notification files"""
    notify_dir = WORKSPACE_DIR / "notifications"
    
    if notify_dir.exists():
        for f in notify_dir.glob("ready_*.json"):
            f.unlink()
        print("🗑️ Notifications cleared")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Notification system')
    parser.add_argument('--check', action='store_true', help='Check pending notifications')
    parser.add_argument('--clear', action='store_true', help='Clear all notifications')
    parser.add_argument('--test', action='store_true', help='Send test notification')
    
    args = parser.parse_args()
    
    if args.check:
        pending = check_pending_notifications()
        print(f"Found {len(pending)} pending notifications")
        for n in pending:
            print(f"  - {n['draft_path']} ({n['timestamp']})")
    elif args.clear:
        clear_notifications()
    elif args.test:
        notify("/tmp/test_draft.txt", "ready")
    else:
        print("Usage: python notifier.py [--check|--clear|--test]")
