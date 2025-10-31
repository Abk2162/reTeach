# reTeach Email Service

A simple Python email service bot for sending emails from admin@reteach.com (or any configured bot email).

## Quick Start

1. Set up your `.env` file (see [SETUP.md](SETUP.md) for detailed instructions):
   ```bash
   cp .env.example .env
   # Edit .env with your email credentials
   ```

2. Run the demo:
   ```bash
   python3 demo.py
   ```

## What You Need

See [SETUP.md](SETUP.md) for complete setup instructions. You'll need:
- A bot email account (Gmail or custom domain)
- SMTP credentials (for Gmail: use an App Password)

## Files

- **[email_service.py](email_service.py)** - Main email service class
- **[demo.py](demo.py)** - Interactive demo script
- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[.env.example](.env.example)** - Environment variable template

## Usage

### Interactive Demo

```bash
python3 demo.py
```

Prompts you to enter:
- Recipient email
- Subject
- Message text (multi-line)

### Programmatic Usage

```python
from email_service import EmailService

service = EmailService()

# Send single email
service.send_email(
    to="user@example.com",
    subject="Welcome!",
    text="Hello from reTeach!"
)

# Send bulk emails
emails = [
    {"to": "user1@example.com", "subject": "Hi", "text": "Message 1"},
    {"to": "user2@example.com", "subject": "Hello", "text": "Message 2"}
]
service.send_bulk_emails(emails)
```

## Features

- Send single or bulk emails
- SMTP connection verification
- Interactive CLI demo
- Support for Gmail and custom SMTP servers
- Uses existing venv (python-dotenv already in requirements.txt)
