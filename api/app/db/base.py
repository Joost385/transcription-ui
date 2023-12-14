from datetime import datetime

from pydantic import BaseModel
from sqlalchemy import Column, DateTime, Integer
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class BaseEntity(Base):
    __abstract__ = True

    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False, onupdate=datetime.utcnow)

    def set_data(self, data: BaseModel, exclude_unset: bool = False):
        for key, value in data.model_dump(exclude_unset=exclude_unset).items():
            setattr(self, key, value)
