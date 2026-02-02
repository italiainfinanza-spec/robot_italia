#!/usr/bin/env python3
"""
Email Sender Module for Robotics Newsletter
Integrates with multiple email providers for automated delivery.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Optional

# Configuration path
CONFIG_PATH = Path("/home/ubuntu/.openclaw/workspace/newsletter/config/email_config.json")

def load_config() -> dict:
    """Load email configuration"""
    if not CONFIG_PATH.exists():
        print(f"❌ Config not found: {CONFIG_PATH}")
        print("Copy email_config.template.json to email_config.json and configure")
        return {}
    
    with open(CONFIG_PATH, 'r') as f:
        return json.load(f)

def send_via_sendgrid(content: str, subject: str, recipients: List[str], config: dict) -> bool:
    """Send email via SendGrid"""
    try:
        import sendgrid
        from sendgrid.helpers.mail import Mail
        
        sg = sendgrid.SendGridAPIClient(api_key=config['api_key'])
        
        message = Mail(
            from_email=config.get('from_email', 'newsletter@example.com'),
            to_emails=recipients,
            subject=subject,
            plain_text_content=content
        )
        
        response = sg.send(message)
        success = response.status_code in [200, 201, 202]
        print(f"   SendGrid response: {response.status_code}")
        return success
    except ImportError:
        print("   ⚠️ SendGrid library not installed. Run: pip install sendgrid")
        return False
    except Exception as e:
        print(f"   ✗ SendGrid error: {e}")
        return False

def send_via_ses(content: str, subject: str, recipients: List[str], config: dict) -> bool:
    """Send email via AWS SES"""
    try:
        import boto3
        
        client = boto3.client(
            'ses',
            region_name=config.get('region', 'us-east-1'),
            aws_access_key_id=config['access_key_id'],
            aws_secret_access_key=config['secret_access_key']
        )
        
        response = client.send_email(
            Source=config.get('from_email', 'newsletter@example.com'),
            Destination={'ToAddresses': recipients},
            Message={
                'Subject': {'Data': subject},
                'Body': {'Text': {'Data': content}}
            }
        )
        print(f"   SES MessageId: {response['MessageId']}")
        return True
    except ImportError:
        print("   ⚠️ boto3 not installed. Run: pip install boto3")
        return False
    except Exception as e:
        print(f"   ✗ SES error: {e}")
        return False

def send_via_smtp(content: str, subject: str, recipients: List[str], config: dict) -> bool:
    """Send email via SMTP"""
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        msg = MIMEMultipart()
        msg['Subject'] = subject
        msg['From'] = config.get('from_email', 'newsletter@example.com')
        msg['To'] = ', '.join(recipients)
        
        msg.attach(MIMEText(content, 'plain', 'utf-8'))
        
        with smtplib.SMTP(config['host'], config['port']) as server:
            server.starttls()
            server.login(config['username'], config['password'])
            server.send_message(msg)
        
        print("   ✓ SMTP send successful")
        return True
    except Exception as e:
        print(f"   ✗ SMTP error: {e}")
        return False

def send_newsletter(draft_path: str, test_mode: bool = False) -> bool:
    """
    Send newsletter from draft file
    
    Args:
        draft_path: Path to newsletter draft file
        test_mode: If True, send only to admin/test addresses
    
    Returns:
        bool: True if sent successfully
    """
    print(f"\n📧 Email Sender Module")
    print("-" * 50)
    
    # Load config
    config = load_config()
    if not config:
        return False
    
    # Check if auto-send is enabled
    if not config.get('delivery', {}).get('auto_send', False) and not test_mode:
        print("⚠️ Auto-send is disabled in config")
        print("   Set delivery.auto_send to true to enable")
        return False
    
    # Read draft content
    try:
        with open(draft_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"✗ Failed to read draft: {e}")
        return False
    
    # Prepare subject
    subject_template = config.get('newsletter', {}).get(
        'subject_template', 
        '🤖 Newsletter Robotica - {date}'
    )
    subject = subject_template.format(date=datetime.now().strftime('%d/%m/%Y'))
    
    # Determine recipients
    if test_mode:
        recipients = config.get('recipients', {}).get('admin', [])
        print(f"🧪 TEST MODE - Sending to admin: {recipients}")
    else:
        recipients = config.get('recipients', {}).get('subscribers', [])
        admin = config.get('recipients', {}).get('admin', [])
        recipients = list(set(recipients + admin))  # Deduplicate
        print(f"📤 Sending to {len(recipients)} recipients")
    
    if not recipients:
        print("✗ No recipients configured")
        return False
    
    # Select provider
    provider = config.get('email_provider', 'none')
    providers = config.get('providers', {})
    
    print(f"📨 Provider: {provider}")
    
    if provider == 'sendgrid' and providers.get('sendgrid', {}).get('enabled'):
        return send_via_sendgrid(content, subject, recipients, providers['sendgrid'])
    elif provider == 'aws_ses' and providers.get('aws_ses', {}).get('enabled'):
        return send_via_ses(content, subject, recipients, providers['aws_ses'])
    elif provider == 'smtp' and providers.get('smtp', {}).get('enabled'):
        return send_via_smtp(content, subject, recipients, providers['smtp'])
    else:
        print(f"⚠️ Provider '{provider}' not enabled or not configured")
        return False

def send_test_email():
    """Send a test email to verify configuration"""
    test_content = """
🤖 Robotics Newsletter - Test Email

This is a test email from your Robotics Newsletter automation system.

If you're receiving this, your email configuration is working correctly!

Configuration checked:
✓ Email provider settings
✓ Authentication credentials
✓ Recipient list

Next steps:
1. Review the configuration
2. Update subscriber list
3. Enable auto-send if desired

---
Generated: {timestamp}
""".format(timestamp=datetime.now().isoformat())
    
    # Write temp file
    test_path = Path("/tmp/newsletter_test.txt")
    with open(test_path, 'w') as f:
        f.write(test_content)
    
    return send_newsletter(str(test_path), test_mode=True)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Send newsletter via email')
    parser.add_argument('draft', nargs='?', help='Path to newsletter draft')
    parser.add_argument('--test', action='store_true', help='Send test email only')
    
    args = parser.parse_args()
    
    if args.test:
        success = send_test_email()
    elif args.draft:
        success = send_newsletter(args.draft)
    else:
        print("Usage:")
        print("  python email_sender.py /path/to/draft.txt")
        print("  python email_sender.py --test")
        sys.exit(1)
    
    sys.exit(0 if success else 1)
