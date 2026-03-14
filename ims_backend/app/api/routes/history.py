# app/api/routes/history.py
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.inventory import StockLedger
from app.models.user import User
from app.schemas.inventory import LedgerOut
from app.services.inventory_service import list_ledger

router = APIRouter(prefix="/history", tags=["History"])


def _ledger_to_out(entry: StockLedger) -> LedgerOut:
    return LedgerOut(
        id=entry.id,
        product_id=entry.product_id,
        product_name=entry.product.name if entry.product else "",
        warehouse_id=entry.warehouse_id,
        warehouse_name=entry.warehouse.name if entry.warehouse else "",
        move_type=entry.move_type,
        delta=entry.delta,
        qty_after=entry.qty_after,
        note=entry.note,
        created_at=entry.created_at,
    )


@router.get("/", response_model=List[LedgerOut])
def get_history(
    product_id: Optional[int] = Query(None),
    warehouse_id: Optional[int] = Query(None),
    move_type: Optional[str] = Query(None),
    limit: int = Query(200, ge=1, le=1000),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    entries = list_ledger(db, product_id=product_id, warehouse_id=warehouse_id,
                          move_type=move_type, limit=limit)
    return [_ledger_to_out(e) for e in entries]
