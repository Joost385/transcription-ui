import secrets

from sqlalchemy.orm import Session

from db.models.password_reset import PasswordReset
from db.models.user import User
from schemas.security import PasswordResetSchema
from security.hashing import hash_password


def find_password_reset_by_token(db: Session, token: str) -> PasswordReset | None:
    return db.query(PasswordReset) \
        .filter(PasswordReset.token == token) \
        .one_or_none()


def create_password_reset(db: Session, user: User) -> PasswordReset:
    token = secrets.token_urlsafe(128)
    passwort_reset = PasswordReset(user=user, token=token)
    db.add(passwort_reset)
    db.commit()
    db.refresh(passwort_reset)
    return passwort_reset


def process_password_reset(db: Session, password_reset: PasswordReset, data: PasswordResetSchema):
    password_hash = hash_password(data.password)
    password_reset.user.password_hash = password_hash
    db.delete(password_reset)
    db.commit()


def user_has_active_password_reset(db: Session, user: User) -> bool:
    password_resets = db.query(PasswordReset) \
        .filter(PasswordReset.user == user) \
        .all()
    
    return any(
        not password_reset.is_expired()
        for password_reset in password_resets
    )