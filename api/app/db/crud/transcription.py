from celery.result import AsyncResult
from sqlalchemy.orm import Session

from constants import TranscriptionState
from db.models.transcription import Transcription
from db.models.user import User
from schemas.transcription import TranscriptionCreateSchema
from worker import transcribe


def find_user_transcription_by_id(db: Session, id: int, user: User) -> Transcription | None:
    return db.query(Transcription) \
        .filter(Transcription.id == id) \
        .filter(Transcription.user == user) \
        .one_or_none()


def find_user_transcriptions(
    db: Session,
    user: User,
    recording_id: int | None = None,
) -> list[Transcription]:
    query = db.query(Transcription)

    if recording_id is not None:
        query = query.filter(Transcription.recording_id == recording_id)

    return query \
        .filter(Transcription.user == user) \
        .order_by(Transcription.id.desc()) \
        .all()


def get_pending_transcriptions_count(db: Session) -> int:
    return db.query(Transcription) \
        .filter(Transcription.state == TranscriptionState.PENDING) \
        .count()


def get_running_transcriptions_count(db: Session) -> int:
    return db.query(Transcription) \
        .filter(Transcription.state == TranscriptionState.RUNNING) \
        .count()


def delete_transcription(db: Session, transcription: Transcription) -> None:
    db.delete(transcription)
    db.commit()


def create_transcription(db: Session, data: TranscriptionCreateSchema, user: User) -> Transcription:
    transcription = Transcription()
    transcription.set_data(data)
    transcription.user = user
    transcription.state = TranscriptionState.PENDING
    db.add(transcription)
    db.commit()
    db.refresh(transcription)
    try:
        task: AsyncResult = transcribe.delay(transcription.id)
        transcription.celery_id = task.id
    except:
        transcription.state = TranscriptionState.FAILURE
    db.commit()
    db.refresh(transcription)
    return transcription
