# app/core/email.py
"""
Sends OTP emails via SMTP.
If SMTP is not configured, prints the OTP to the terminal (dev mode).
"""
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings


def send_otp_email(to_email: str, otp: str) -> None:
    """Send OTP. Falls back to terminal print if SMTP is not configured."""

    if not settings.SMTP_HOST or not settings.SMTP_USER:
        # ── DEV MODE: print to terminal ──────────────────────────────
        print("\n" + "=" * 50)
        print(f"  [CoreInventory] OTP for {to_email}")
        print(f"  Code: {otp}")
        print(f"  (Expires in {settings.OTP_EXPIRE_MINUTES} minutes)")
        print("=" * 50 + "\n")
        return

    # ── PRODUCTION: send via SMTP ────────────────────────────────────
    subject = "Your CoreInventory password reset code"
    body = f"""
    <html><body style="font-family:sans-serif;color:#333">
      <h2>Password Reset</h2>
      <p>Your one-time code is:</p>
      <h1 style="letter-spacing:8px;color:#a0522d">{otp}</h1>
      <p>This code expires in {settings.OTP_EXPIRE_MINUTES} minutes.</p>
      <p style="color:#999;font-size:12px">If you didn't request this, ignore this email.</p>
    </body></html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.EMAILS_FROM
    msg["To"] = to_email
    msg.attach(MIMEText(body, "html"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.EMAILS_FROM, to_email, msg.as_string())
