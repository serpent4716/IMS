# app/api/routes/operations.py
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.inventory import MoveDocumentIn, MoveDocumentOut, MoveDocumentUpdate
from app.services.inventory_service import (
    cancel_document,
    create_move_document,
    get_document_or_404,
    list_move_documents,
    update_move_document,
    validate_document,
)

router = APIRouter(prefix="/operations", tags=["Operations"])


@router.get("/", response_model=List[MoveDocumentOut])
def get_documents(
    move_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    warehouse_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return list_move_documents(db, move_type=move_type, status=status, warehouse_id=warehouse_id)


@router.post("/", response_model=MoveDocumentOut, status_code=201)
def create_document(
    data: MoveDocumentIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_move_document(db, data, current_user)


@router.get("/{doc_id}", response_model=MoveDocumentOut)
def get_document(
    doc_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return get_document_or_404(db, doc_id)


@router.patch("/{doc_id}", response_model=MoveDocumentOut)
def edit_document(
    doc_id: int,
    data: MoveDocumentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return update_move_document(db, doc_id, data)


@router.post("/{doc_id}/validate", response_model=MoveDocumentOut)
def validate_doc(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return validate_document(db, doc_id, current_user)


@router.post("/{doc_id}/cancel", response_model=MoveDocumentOut)
def cancel_doc(
    doc_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return cancel_document(db, doc_id)
