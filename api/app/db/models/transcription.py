from sqlalchemy import JSON, Boolean, Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import deferred, relationship

from constants import NeMoConfigs, TranscriptionState, WhisperModels
from db.base import BaseEntity


class Transcription(BaseEntity):
    __tablename__ = "transcriptions"

    celery_id = Column(String(255), nullable=True, unique=True)
    state = Column(Enum(TranscriptionState), default=TranscriptionState.PENDING)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    transcript = deferred(Column(JSON, nullable=True))
    identify_speakers = Column(Boolean, nullable=False, default=False)
    email_notification = Column(Boolean, nullable=False, default=False)
    whisper_model = Column(Enum(WhisperModels), nullable=False)
    nemo_config = Column(Enum(NeMoConfigs), nullable=True)
    num_speakers = Column(Integer, nullable=True)
    language = Column(String(255), nullable=True)
    recording_id = Column(Integer, ForeignKey("recordings.id", ondelete="CASCADE"), nullable=False)
    recording = relationship("Recording", back_populates="transcriptions")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user = relationship("User", back_populates="transcriptions")


    def is_success(self) -> bool:
        return self.state == TranscriptionState.SUCCESS