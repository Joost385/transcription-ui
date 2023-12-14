import os

from decouple import config
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from db.base import BaseEntity
from schemas.recording import RECORDING_MIME_TYPES

FILES_STORAGE_PATH = config("FILES_STORAGE_PATH")


class Recording(BaseEntity):
    __tablename__ = "recordings"

    filename = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    format = Column(String(255), nullable=False)
    size = Column(Integer, nullable=False)
    duration = Column(Integer, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user = relationship("User", back_populates="recordings")
    transcriptions = relationship("Transcription", back_populates="recording", cascade="delete, delete-orphan")


    def get_path(self) -> str:
        return os.path.join(FILES_STORAGE_PATH, self.filename)
    

    def get_mime_type(self) -> str:
        return next(k for k, v in RECORDING_MIME_TYPES.items() if v == self.format)
