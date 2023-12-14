import asyncio
from datetime import datetime

from celery import Celery
from celery.app.control import Control, Inspect
from decouple import config
from sqlalchemy import or_

from constants import TranscriptionState
from db.models.transcription import Transcription
from db.session import session
from notification.send import send_transcription_notification
from pipeline.pipeline import run_pipeline

REDIS_URL = config("REDIS_URL")

app = Celery(
    __name__,
    broker=REDIS_URL,
    backend=REDIS_URL,
)


@app.task(ignore_result=True)
def transcribe(transcription_id: int) -> None:
    with session() as db:
        transcription = db.query(Transcription) \
            .filter(Transcription.id == transcription_id) \
            .one_or_none()
        if transcription:
            transcription.started_at = datetime.utcnow()
            transcription.state = TranscriptionState.RUNNING
            db.commit()
            try:
                transcript = run_pipeline(transcription)
                transcription.transcript = transcript
                transcription.language = transcript["language"]
                if transcription.identify_speakers and not transcription.num_speakers:
                    transcription.num_speakers = transcript["num_speakers"]
                transcription.state = TranscriptionState.SUCCESS
            except Exception as e:
                print(f"An error occurred while running the pipeline: {e}")
                transcription.state = TranscriptionState.FAILURE
            transcription.finished_at = datetime.utcnow()
            db.commit()
            if transcription.email_notification:
                future = send_transcription_notification(transcription)
                loop = asyncio.get_event_loop()
                loop.run_until_complete(future)


def terminate_task(task_id: str) -> None:
    control: Control = app.control
    control.revoke(task_id, terminate=True)


def terminate_all_transcriptions() -> None:
    with session() as db:
        transcriptions = \
            db.query(Transcription).filter(or_(
                Transcription.state == TranscriptionState.PENDING,
                Transcription.state == TranscriptionState.RUNNING)
            ).all()
        for transcription in transcriptions:
            if transcription.celery_id:
                terminate_task(transcription.celery_id)
            transcription.state = TranscriptionState.FAILURE
        db.commit()


def get_task_ids() -> list[str]:
    inspect: Inspect = app.control.inspect()
    task_ids = []
    for task_list in (inspect.active() or {}).values():
        task_ids.extend(task["id"] for task in task_list)
    for task_list in (inspect.reserved() or {}).values():
        task_ids.extend(task["id"] for task in task_list)
    return task_ids


async def sync_transcriptions() -> None:
    try:
        loop = asyncio.get_event_loop()
        task_ids = await loop.run_in_executor(None, get_task_ids)

        with session() as db:
            transcriptions = \
                db.query(Transcription).filter(or_(
                    Transcription.state == TranscriptionState.PENDING,
                    Transcription.state == TranscriptionState.RUNNING)
                ).all()
            for transcription in transcriptions:
                if not transcription.celery_id in task_ids:
                    transcription.state = TranscriptionState.FAILURE
            db.commit()
    except Exception as e:
        print(f"Could not synchronize transcriptions: {e}")