from typing import Annotated

from pydantic import BaseModel, EmailStr, constr, validator
from sqlalchemy import exists

from db.models.user import User
from db.session import session


class UserSchema(BaseModel):
    id: int
    email: EmailStr
    firstname: str
    lastname: str
    admin: bool
    active: bool

    class Config:
        from_attributes = True


class UserCreateSchema(BaseModel):
    email: Annotated[EmailStr, constr(max_length=255)]
    firstname: constr(max_length=255)
    lastname: constr(max_length=255)
    admin: bool = False
    active: bool = False

    @validator("email")
    def unique_email(cls, email):
        with session() as db:
            result = db.query(exists().where(User.email == email)).one()
            if result[0]:
                raise ValueError("Email already in use")
        return email


class UserEditSchema(BaseModel):
    email: Annotated[EmailStr, constr(max_length=255)] | None = None
    firstname: constr(max_length=255) | None = None
    lastname: constr(max_length=255) | None = None
    admin: bool | None = None
    active: bool | None = None
