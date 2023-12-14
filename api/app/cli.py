import typer
import whisper
from decouple import config

from db.models.user import User
from db.session import create_all, drop_all, session
from schemas.transcription import WhisperModels
from security.hashing import hash_password

MODELS_STORAGE_PATH = config("MODELS_STORAGE_PATH")

cli = typer.Typer()


@cli.command(help="Synchronizes the database schema.")
def db_create_all():
    create_all()


@cli.command(help="Drops all tables managed by SQLAlchemy.")
def db_drop_all():
    typer.confirm("Are you sure you want to drop all tables?", abort=True)
    drop_all()


@cli.command(epilog="terst", help="Creates a new admin user.")
def create_admin(
    firstname: str = typer.Option(
        default=...,
        prompt=True,
        help="The admins first name.",
    ),
    lastname: str = typer.Option(
        default=...,
        prompt=True,
        help="The admins last name."
    ),
    email: str = typer.Option(
        default=...,
        prompt=True,
        help="The admins email address.",
    ),
    password: str = typer.Option(
        default=...,
        hide_input=True,
        prompt=True,
        confirmation_prompt=True,
        help="The admins password.",
    ),
):
    with session() as db:
        user = User(
            firstname=firstname,
            lastname=lastname,
            email=email,
            password_hash=hash_password(password),
            admin=True,
            active=True,
        )
        db.add(user)
        db.commit()


@cli.command(help="Downloads all available whisper models.")
def download_whisper_models():
    for whisper_model in WhisperModels:
        print(f"\nDownloading {whisper_model.value}...")
        whisper.load_model(
            name=whisper_model.value,
            download_root=MODELS_STORAGE_PATH,
        )
