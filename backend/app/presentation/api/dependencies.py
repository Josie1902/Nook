from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.infrastructure.auth.db.session import SessionLocal
from app.domain.entities.user import User


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
