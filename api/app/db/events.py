import os

from sqlalchemy import event

from db.models.recording import Recording
from db.models.transcription import Transcription
from worker import terminate_task


@event.listens_for(Recording, "after_delete")
def receive_after_delete(mapper, connection, recording: Recording):
    path = recording.get_path()
    if os.path.exists(path):
        os.unlink(path)


@event.listens_for(Transcription, "after_delete")
def receive_after_delete(mapper, connection, transcription: Transcription):
    if transcription.celery_id:
        terminate_task(transcription.celery_id)