from decouple import config
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from db.base import Base

DATABASE_URL = config("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
)

session = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def create_all():
    Base.metadata.create_all(bind=engine)


def drop_all():
    Base.metadata.drop_all(bind=engine)


def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()
