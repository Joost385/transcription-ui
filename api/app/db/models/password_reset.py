from datetime import datetime, timedelta
from urllib.parse import urljoin

from decouple import config
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from db.base import BaseEntity

BASE_URL = config("BASE_URL")
PASSWORD_RESET_EXPIRY_MINUTES = config("PASSWORD_RESET_EXPIRY_MINUTES", cast=int)


class PasswordReset(BaseEntity):
    __tablename__ = "password_resets"

    token = Column(String(255), nullable=False, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user = relationship("User", back_populates="password_resets")


    def get_token_url(self) -> str:
        return urljoin(BASE_URL, f"password-reset/{self.token}")


    def is_expired(self) -> bool:
        delta = datetime.now() - self.created_at
        return delta >= timedelta(minutes=PASSWORD_RESET_EXPIRY_MINUTES)
    

    def get_expiry_minutes(self) -> int:
        return PASSWORD_RESET_EXPIRY_MINUTES
