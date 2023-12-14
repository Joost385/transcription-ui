from datetime import datetime
from typing import Optional

from pydantic import BaseModel, conint

from constants import NeMoConfigs, TranscriptionState, WhisperModels
from schemas.recording import RecordingSchema


class TranscriptionSchema(BaseModel):
    id: int
    recording: RecordingSchema
    state: TranscriptionState
    started_at: datetime | None
    finished_at: datetime | None
    identify_speakers: bool
    email_notification: bool
    whisper_model: WhisperModels
    nemo_config: NeMoConfigs | None
    num_speakers: int | None
    language: str | None

    class Config:
        from_attributes = True


class TranscriptionCreateSchema(BaseModel):
    recording_id: int
    identify_speakers: bool
    email_notification: bool
    whisper_model: WhisperModels
    nemo_config: Optional[NeMoConfigs] = None
    num_speakers: Optional[conint(ge=2, le=8)] = None


class TranscriptionProgressSchema(BaseModel):
    state: TranscriptionState
    took: int | None


class SpeakerSegmentSchema(BaseModel):
    speaker: str
    start: float
    end: float
    text: str


class TranscriptSchema(BaseModel):
    text: str
    language: str
    num_speakers: int | None
    speaker_segments: list[SpeakerSegmentSchema] | None
