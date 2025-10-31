# Email Service Setup Instructions

## What You Need to Provide

### 1. Bot Email Account
You need an email account that will send emails as your bot (e.g., admin@reteach.com).

### 2. SMTP Credentials

#### Option A: Using Gmail (Recommended for Testing)

**What I need from you:**
1. A Gmail account (can create a new one like reteachbot@gmail.com)
2. Enable 2-Factor Authentication on this Gmail account
3. Create an App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "reTeach Bot"
   - Google will generate a 16-character password
   - **Copy this password - you'll need it for the .env file**

**SMTP Settings for Gmail:**
- Host: `smtp.gmail.com`
- Port: `587`

#### Option B: Using Custom Domain Email (e.g., admin@reteach.com)

**What I need from you:**
1. Your email address (e.g., admin@reteach.com)
2. Your email password
3. SMTP server details from your email provider:
   - SMTP Host (e.g., smtp.reteach.com or mail.reteach.com)
   - SMTP Port (usually 587 or 465)
   - Whether it uses TLS/SSL (usually yes)

Common providers:
- **GoDaddy/Namecheap**: smtp.yourprovider.com, port 587
- **Office365**: smtp.office365.com, port 587
- **Outlook**: smtp-mail.outlook.com, port 587

---

## Setup Steps

### 1. Create `.env` file in the `/email` directory:

```bash
cd /path/to/reTeach/email
cp .env.example .env
```

### 2. Edit `.env` file with your credentials:

**For Gmail:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
BOT_EMAIL=your-gmail@gmail.com
BOT_PASSWORD=your-16-char-app-password
```

**For Custom Domain:**
```env
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587
BOT_EMAIL=admin@reteach.com
BOT_PASSWORD=your-email-password
```

### 3. Use your existing venv:

```bash
# If not already activated
source /path/to/reTeach/backend/venv/bin/activate

# python-dotenv is already in your requirements.txt, so you're good!
```

### 4. Run the demo:

```bash
cd /path/to/reTeach/email
python3 demo.py
```

---

## Demo Script Usage

The demo script (`demo.py`) will:
1. Verify your email connection
2. Prompt you for:
   - Recipient email address
   - Email subject
   - Email text (multi-line, press Enter on empty line to finish)
3. Show you a preview
4. Ask for confirmation before sending

---

## Programmatic Usage

```python
from email_service import EmailService

# Initialize
service = EmailService()

# Send single email
service.send_email(
    to="user@example.com",
    subject="Welcome to reTeach!",
    text="Hello! This is a test email from reTeach bot."
)

# Send bulk emails
emails = [
    {"to": "user1@example.com", "subject": "Hi!", "text": "Message 1"},
    {"to": "user2@example.com", "subject": "Hello!", "text": "Message 2"}
]
service.send_bulk_emails(emails)
```

---

## Troubleshooting

**"Connection failed" error:**
- Double-check your SMTP_HOST and SMTP_PORT
- For Gmail: Make sure you're using an App Password, not your regular password
- Check if 2FA is enabled (required for Gmail)

**"Authentication failed" error:**
- Verify BOT_EMAIL and BOT_PASSWORD are correct
- For Gmail: Use the 16-character App Password (no spaces)

**"Permission denied" error:**
- Some email providers block SMTP access by default
- Check your email provider's settings to enable SMTP/IMAP access
