#!/usr/bin/env python3
"""
reTeach Email Service Demo
Interactive script to send emails from your bot
"""

from email_service import EmailService


def get_multiline_input(prompt: str) -> str:
    """Get multi-line input from user"""
    print(prompt)
    print("(Type your message, then press Enter on an empty line to finish)")
    lines = []
    while True:
        line = input()
        if line == "":
            break
        lines.append(line)
    return "\n".join(lines)


def main():
    print("=" * 50)
    print("   reTeach Email Service Demo")
    print("=" * 50)
    print()

    # Initialize email service
    try:
        email_service = EmailService()
    except ValueError as e:
        print(f"Configuration Error: {e}")
        print("\nPlease set up your .env file first!")
        return

    # Verify connection
    print("Verifying email service connection...")
    if not email_service.verify_connection():
        print("\n⚠️  Email service connection failed!")
        print("Please check your .env file configuration.")
        return

    print()

    # Get email details
    to_email = input("Enter recipient email address: ").strip()
    subject = input("Enter email subject: ").strip()
    text = get_multiline_input("\nEnter email text:")

    # Preview
    print("\n" + "-" * 50)
    print("EMAIL PREVIEW")
    print("-" * 50)
    print(f"To: {to_email}")
    print(f"From: {email_service.bot_email}")
    print(f"Subject: {subject}")
    print(f"\nMessage:\n{text}")
    print("-" * 50)

    # Confirm
    confirm = input("\nSend this email? (yes/no): ").strip().lower()

    if confirm in ['yes', 'y']:
        print("\nSending email...")
        result = email_service.send_email(to_email, subject, text)

        if result['success']:
            print("\n✓ Email sent successfully!")
        else:
            print(f"\n✗ Failed to send email: {result.get('error', 'Unknown error')}")
    else:
        print("\nEmail cancelled.")


if __name__ == "__main__":
    main()
