# app/api/routes/products.py
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_manager
from app.db.session import get_db
from app.models.user import User
from app.schemas.inventory import CategoryIn, CategoryOut, ProductIn, ProductOut, ProductUpdate
from app.services.inventory_service import (
    create_category,
    create_product,
    delete_product,
    get_product_or_404,
    list_categories,
    list_products,
    update_product,
)

router = APIRouter(prefix="/products", tags=["Products"])


# ── Categories ────────────────────────────────────────────────────────────────

@router.get("/categories", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return list_categories(db)


@router.post("/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def add_category(
    data: CategoryIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    return create_category(db, data)


# ── Products ──────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[ProductOut])
def get_products(
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    low_stock: bool = Query(False),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return list_products(db, search=search, category_id=category_id, low_stock_only=low_stock)


@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def add_product(
    data: ProductIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager),
):
    return create_product(db, data, current_user)


@router.get("/{product_id}", response_model=ProductOut)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return get_product_or_404(db, product_id)


@router.patch("/{product_id}", response_model=ProductOut)
def edit_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    return update_product(db, product_id, data)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    delete_product(db, product_id)
