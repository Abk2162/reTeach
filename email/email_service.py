import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict
import os
from dotenv import load_dotenv

load_dotenv()


class EmailService:
    def __init__(self):
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.bot_email = os.getenv('BOT_EMAIL')
        self.bot_password = os.getenv('BOT_PASSWORD')

        if not self.bot_email or not self.bot_password:
            raise ValueError("BOT_EMAIL and BOT_PASSWORD must be set in .env file")

    def send_email(self, to: str, subject: str, text: str) -> Dict[str, any]:
        """Send a single email"""
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = f"reTeach Bot <{self.bot_email}>"
            msg['To'] = to
            msg['Subject'] = subject
            msg.attach(MIMEText(text, 'plain'))

            # Connect to SMTP server
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.bot_email, self.bot_password)
                server.send_message(msg)

            print(f"✓ Email sent successfully to {to}")
            return {'success': True, 'to': to}

        except Exception as e:
            print(f"✗ Error sending email to {to}: {str(e)}")
            return {'success': False, 'to': to, 'error': str(e)}

    def send_bulk_emails(self, email_list: List[Dict[str, str]]) -> List[Dict[str, any]]:
        """Send multiple emails"""
        results = []

        for email in email_list:
            result = self.send_email(
                email['to'],
                email['subject'],
                email['text']
            )
            results.append(result)

        return results

    def verify_connection(self) -> bool:
        """Test SMTP connection"""
        try:
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.bot_email, self.bot_password)
            print("✓ Email service connection verified")
            return True
        except Exception as e:
            print(f"✗ Connection failed: {str(e)}")
            return False


if __name__ == "__main__":
    # Quick test
    service = EmailService()
    service.verify_connection()
