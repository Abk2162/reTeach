"""
Email Service for Backend
Wrapper around the email service to send diagnostic results to students
Supports both SMTP (Gmail) and SendGrid for flexibility
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict, Optional
from app.config import settings


class BackendEmailService:
    """Email service for sending diagnostic results"""

    def __init__(self):
        self.smtp_host = settings.smtp_host
        self.smtp_port = settings.smtp_port
        self.bot_email = settings.bot_email
        self.bot_password = settings.bot_password
        self.sendgrid_api_key = settings.sendgrid_api_key
        self.from_email = settings.from_email

        # Prefer SendGrid if API key is configured
        self.use_sendgrid = bool(self.sendgrid_api_key)

    def send_diagnostic_results(
        self,
        student_email: str,
        student_name: str,
        score_percentage: float,
        correct_answers: int,
        total_questions: int,
        weak_topics_resources: Dict[str, Dict[str, any]]
    ) -> Dict[str, any]:
        """
        Send diagnostic results email to student with personalized resources

        Args:
            student_email: Student's email address
            student_name: Student's name
            score_percentage: Overall score percentage
            correct_answers: Number of correct answers
            total_questions: Total number of questions
            weak_topics_resources: Dict of topic -> {khan_academy_url, textbook_pages, description}

        Returns:
            Dict with success status and any error message
        """
        try:
            subject = "Your Diagnostic Results & Study Resources"

            # Build email body
            body = self._build_results_email_body(
                student_name=student_name,
                score_percentage=score_percentage,
                correct_answers=correct_answers,
                total_questions=total_questions,
                weak_topics_resources=weak_topics_resources
            )

            # Send email
            result = self._send_email(
                to=student_email,
                subject=subject,
                body=body
            )

            return result

        except Exception as e:
            print(f"[EMAIL ERROR] Failed to send diagnostic results: {e}")
            return {'success': False, 'error': str(e)}

    def _build_results_email_body(
        self,
        student_name: str,
        score_percentage: float,
        correct_answers: int,
        total_questions: int,
        weak_topics_resources: Dict[str, Dict[str, any]]
    ) -> str:
        """Build the email body with results and resources"""

        body = f"""Hello {student_name},

Thank you for completing your diagnostic assessment!

--- YOUR RESULTS ---
Score: {correct_answers}/{total_questions} ({score_percentage:.1f}%)

"""

        if weak_topics_resources:
            body += """--- RECOMMENDED STUDY RESOURCES ---

Based on your responses, here are some topics you might want to review:

"""
            for topic, resources in weak_topics_resources.items():
                body += f"\n📚 {topic}\n"
                body += f"   Khan Academy: {resources['khan_academy_url']}\n"
                body += f"   Textbook Pages: {resources['textbook_pages']}\n"
                body += f"   {resources['description']}\n"

            body += "\n"
        else:
            body += "\nGreat job! You showed strong understanding across all topics.\n\n"

        body += """--- NEXT STEPS ---
1. Review the resources above for topics you found challenging
2. Practice with additional problems in those areas
3. Reach out to your teacher if you need additional support

Keep up the great work!

Best regards,
reTeach Team

---
This is an automated message. Please do not reply to this email.
"""

        return body

    def _send_email(self, to: str, subject: str, body: str) -> Dict[str, any]:
        """Send email via SendGrid API or SMTP fallback"""
        if self.use_sendgrid:
            return self._send_via_sendgrid(to, subject, body)
        else:
            return self._send_via_smtp(to, subject, body)

    def _send_via_sendgrid(self, to: str, subject: str, body: str) -> Dict[str, any]:
        """Send email via SendGrid API"""
        try:
            import httpx

            from_email = self.from_email or "noreply@reteach.app"

            data = {
                "personalizations": [{
                    "to": [{"email": to}],
                    "subject": subject
                }],
                "from": {"email": from_email, "name": "reTeach"},
                "content": [{
                    "type": "text/plain",
                    "value": body
                }]
            }

            headers = {
                "Authorization": f"Bearer {self.sendgrid_api_key}",
                "Content-Type": "application/json"
            }

            with httpx.Client() as client:
                response = client.post(
                    "https://api.sendgrid.com/v3/mail/send",
                    json=data,
                    headers=headers,
                    timeout=10.0
                )

            if response.status_code in [200, 201, 202]:
                print(f"[EMAIL] Successfully sent via SendGrid to {to}")
                return {'success': True, 'to': to, 'method': 'sendgrid'}
            else:
                error_msg = f"SendGrid API error: {response.status_code} - {response.text}"
                print(f"[EMAIL ERROR] {error_msg}")
                return {'success': False, 'to': to, 'error': error_msg}

        except Exception as e:
            print(f"[EMAIL ERROR] SendGrid failed for {to}: {e}")
            return {'success': False, 'to': to, 'error': str(e)}

    def _send_via_smtp(self, to: str, subject: str, body: str) -> Dict[str, any]:
        """Send email via SMTP (Gmail fallback)"""
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = f"reTeach Bot <{self.bot_email}>"
            msg['To'] = to
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))

            # Connect and send
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.bot_email, self.bot_password)
                server.send_message(msg)

            print(f"[EMAIL] Successfully sent via SMTP to {to}")
            return {'success': True, 'to': to, 'method': 'smtp'}

        except Exception as e:
            print(f"[EMAIL ERROR] SMTP failed for {to}: {e}")
            return {'success': False, 'to': to, 'error': str(e)}

    def verify_connection(self) -> bool:
        """Test SMTP connection"""
        try:
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.bot_email, self.bot_password)
            print("[EMAIL] Connection verified successfully")
            return True
        except Exception as e:
            print(f"[EMAIL ERROR] Connection failed: {e}")
            return False


# Global instance
_email_service: Optional[BackendEmailService] = None


def get_email_service() -> BackendEmailService:
    """Get or create global email service instance"""
    global _email_service
    if _email_service is None:
        _email_service = BackendEmailService()
    return _email_service
