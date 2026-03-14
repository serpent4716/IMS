# app/api/routes/warehouses.py
from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_manager
from app.db.session import get_db
from app.models.user import User
from app.schemas.inventory import WarehouseIn, WarehouseOut
from app.services.inventory_service import (
    create_warehouse,
    delete_warehouse,
    list_warehouses,
    update_warehouse,
)

router = APIRouter(prefix="/warehouses", tags=["Warehouses"])


@router.get("/", response_model=List[WarehouseOut])
def get_warehouses(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return list_warehouses(db)


@router.post("/", response_model=WarehouseOut, status_code=status.HTTP_201_CREATED)
def add_warehouse(
    data: WarehouseIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    return create_warehouse(db, data)


@router.put("/{wh_id}", response_model=WarehouseOut)
def edit_warehouse(
    wh_id: int,
    data: WarehouseIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    return update_warehouse(db, wh_id, data)


@router.delete("/{wh_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_warehouse(
    wh_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    delete_warehouse(db, wh_id)
