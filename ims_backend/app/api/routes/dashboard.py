# app/api/routes/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.inventory import DashboardOut
from app.services.inventory_service import get_dashboard

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/", response_model=DashboardOut)
def dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return get_dashboard(db)
