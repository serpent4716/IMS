# app/services/auth_service.py
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.email import send_otp_email
from app.core.security import (
    create_access_token,
    generate_otp,
    hash_password,
    verify_password,
)
from app.models.user import OTPRecord, User
from app.schemas.auth import LoginIn, RegisterIn


def register_user(db: Session, data: RegisterIn) -> tuple[User, str]:
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        full_name=data.full_name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(str(user.id))
    return user, token


def login_user(db: Session, data: LoginIn) -> tuple[User, str]:
    user = db.query(User).filter(User.email == data.email, User.is_active == True).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(str(user.id))
    return user, token


def send_password_reset_otp(db: Session, email: str) -> None:
    user = db.query(User).filter(User.email == email, User.is_active == True).first()
    if not user:
        # Don't reveal whether email exists – just return silently
        return

    # Invalidate any previous OTPs for this email
    db.query(OTPRecord).filter(OTPRecord.email == email, OTPRecord.used == False).update(
        {"used": True}
    )

    otp = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    record = OTPRecord(
        email=email,
        otp_hash=hash_password(otp),   # store hashed – never plain
        expires_at=expires_at,
    )
    db.add(record)
    db.commit()

    send_otp_email(email, otp)


def reset_password_with_otp(db: Session, email: str, otp: str, new_password: str) -> None:
    now = datetime.now(timezone.utc)

    # Fetch the most recent unused valid record for this email
    record = (
        db.query(OTPRecord)
        .filter(
            OTPRecord.email == email,
            OTPRecord.used == False,
            OTPRecord.expires_at > now,
        )
        .order_by(OTPRecord.created_at.desc())
        .first()
    )

    if not record or not verify_password(otp, record.otp_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )

    # Mark OTP as used
    record.used = True

    # Update user password
    user = db.query(User).filter(User.email == email, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.hashed_password = hash_password(new_password)
    db.commit()
