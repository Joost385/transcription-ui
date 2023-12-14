from sqlalchemy import Boolean, Column, String
from sqlalchemy.orm import relationship

from db.base import BaseEntity


class User(BaseEntity):
    __tablename__ = "users"

    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=True)
    firstname = Column(String(255), nullable=False)
    lastname = Column(String(255), nullable=False)
    admin = Column(Boolean, nullable=False)
    active = Column(Boolean, nullable=False)
    recordings = relationship("Recording", back_populates="user", cascade="delete, delete-orphan")
    transcriptions = relationship("Transcription", back_populates="user", cascade="delete, delete-orphan")
    password_resets = relationship("PasswordReset", back_populates="user", cascade="delete, delete-orphan")
