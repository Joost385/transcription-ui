import re

from pydantic import BaseModel, validator

# Taken from: https://uibakery.io/regex-library/password-regex-python
PASSWORD_PATTERN = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
PASSWORD_WEAK_MESSAGE = "Your password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character (#?!@$%^&*-)."

class TokenSchema(BaseModel):
    access_token: str
    token_type: str


class PasswordResetSchema(BaseModel):
    password: str
    password_repeat: str

    @validator("password")
    def strong_password(cls, password):
        if not re.match(PASSWORD_PATTERN, password):
            raise ValueError(PASSWORD_WEAK_MESSAGE)
        return password
