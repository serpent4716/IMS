# app/schemas/user.py
from pydantic import BaseModel, field_validator
from typing import Optional


class UpdateProfileIn(BaseModel):
    full_name: str

    @field_validator("full_name")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Full name cannot be empty")
        return v.strip()


class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("New password must be at least 8 characters")
        return v
