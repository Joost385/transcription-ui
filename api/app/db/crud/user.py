from sqlalchemy.orm import Session

from db.models.user import User
from schemas.user import UserCreateSchema, UserEditSchema


def find_user_by_id(db: Session, id: int) -> User | None:
    return db.query(User).filter(User.id == id).one_or_none()


def find_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).one_or_none()


def find_all_users(db: Session) -> list[User]:
    return db.query(User).order_by(User.id.desc()).all()


def delete_user(db: Session, user: User) -> None:
    db.delete(user)
    db.commit()


def create_user(db: Session, data: UserCreateSchema) -> User:
    user = User()
    user.set_data(data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def edit_user(db: Session, user: User, data: UserEditSchema) -> User:
    user.set_data(data, exclude_unset=True)
    db.commit()
    db.refresh(user)
    return user
