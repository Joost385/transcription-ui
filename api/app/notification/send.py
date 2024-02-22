import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from decouple import config

from db.models.password_reset import PasswordReset
from db.models.transcription import Transcription
from notification.render import render_template

EMAIL_HOST = config("EMAIL_HOST")
EMAIL_PORT = config("EMAIL_PORT", cast=int)
EMAIL_USER = config("EMAIL_USER")
EMAIL_PASSWORD = config("EMAIL_PASSWORD")


def send_email(to: str, subject: str, content: str):
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = EMAIL_USER
    message["To"] = to
    html = MIMEText(content, "html")
    message.attach(html)
    with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as smtp:
        if EMAIL_PASSWORD and EMAIL_USER:
            smtp.starttls()
            smtp.login(EMAIL_USER, EMAIL_PASSWORD)
        smtp.sendmail(EMAIL_USER, to, message.as_string())


async def send_transcription_notification(transcription: Transcription):
    subject = "Transcription Successful" if transcription.is_success() else "Transcription Failed"
    send_email(
        to=transcription.user.email,
        subject=subject,
        content=await render_template(
            "transcription_notification.mjml",
            transcription=transcription,
        )
    )


async def send_password_reset(password_reset: PasswordReset):
    is_reset = bool(password_reset.user.password_hash)
    subject = "Reset Password" if is_reset else "Set Your Password"
    send_email(
        to=password_reset.user.email,
        subject=subject,
        content=await render_template(
            "password_reset.mjml",
            is_reset=is_reset,
            password_reset=password_reset
        )
    )