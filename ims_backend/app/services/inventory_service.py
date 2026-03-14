# app/services/inventory_service.py
"""
Core inventory operations:
  - Product CRUD
  - Warehouse CRUD
  - Category CRUD
  - Move document lifecycle (create → validate)
  - Stock level updates + ledger entries
  - Dashboard KPIs
"""
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.inventory import (
    Category, DocStatus, MoveDocument, MoveLine,
    MoveType, Product, StockLedger, StockLevel, Warehouse,
)
from app.models.user import User
from app.schemas.inventory import (
    CategoryIn, MoveDocumentIn, MoveDocumentUpdate,
    ProductIn, ProductOut, ProductUpdate,
    StockLevelOut, WarehouseIn,
)


# ── Reference number generator ────────────────────────────────────────────────

_PREFIX = {
    "receipt":    "REC",
    "delivery":   "DEL",
    "transfer":   "TRF",
    "adjustment": "ADJ",
}


def _next_reference(db: Session, move_type: str) -> str:
    prefix = _PREFIX.get(move_type, "DOC")
    year = datetime.now(timezone.utc).year
    count = (
        db.query(func.count(MoveDocument.id))
        .filter(MoveDocument.move_type == move_type)
        .scalar()
        or 0
    )
    return f"{prefix}/{year}/{count + 1:04d}"


# ── Stock helpers ─────────────────────────────────────────────────────────────

def _get_or_create_stock(db: Session, product_id: int, warehouse_id: int) -> StockLevel:
    sl = (
        db.query(StockLevel)
        .filter(StockLevel.product_id == product_id, StockLevel.warehouse_id == warehouse_id)
        .first()
    )
    if not sl:
        sl = StockLevel(product_id=product_id, warehouse_id=warehouse_id, quantity=0)
        db.add(sl)
        db.flush()
    return sl


def _apply_delta(
    db: Session,
    product_id: int,
    warehouse_id: int,
    delta: float,
    move_type: str,
    document_id: Optional[int],
    created_by_id: int,
    note: Optional[str] = None,
) -> None:
    sl = _get_or_create_stock(db, product_id, warehouse_id)
    sl.quantity = round(sl.quantity + delta, 6)

    if sl.quantity < 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Insufficient stock for product id={product_id} in warehouse id={warehouse_id}",
        )

    entry = StockLedger(
        product_id=product_id,
        warehouse_id=warehouse_id,
        document_id=document_id,
        move_type=move_type,
        delta=delta,
        qty_after=sl.quantity,
        note=note,
        created_by_id=created_by_id,
    )
    db.add(entry)


# ── Warehouse ─────────────────────────────────────────────────────────────────

def create_warehouse(db: Session, data: WarehouseIn) -> Warehouse:
    if db.query(Warehouse).filter(Warehouse.name == data.name).first():
        raise HTTPException(status_code=409, detail="Warehouse with this name already exists")
    wh = Warehouse(name=data.name, location=data.location)
    db.add(wh)
    db.commit()
    db.refresh(wh)
    return wh


def list_warehouses(db: Session) -> List[Warehouse]:
    return db.query(Warehouse).filter(Warehouse.is_active == True).all()


def get_warehouse_or_404(db: Session, wh_id: int) -> Warehouse:
    wh = db.query(Warehouse).filter(Warehouse.id == wh_id).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return wh


def update_warehouse(db: Session, wh_id: int, data: WarehouseIn) -> Warehouse:
    wh = get_warehouse_or_404(db, wh_id)
    wh.name = data.name
    wh.location = data.location
    db.commit()
    db.refresh(wh)
    return wh


def delete_warehouse(db: Session, wh_id: int) -> None:
    wh = get_warehouse_or_404(db, wh_id)
    wh.is_active = False
    db.commit()


# ── Category ──────────────────────────────────────────────────────────────────

def create_category(db: Session, data: CategoryIn) -> Category:
    if db.query(Category).filter(Category.name == data.name).first():
        raise HTTPException(status_code=409, detail="Category already exists")
    cat = Category(name=data.name)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def list_categories(db: Session) -> List[Category]:
    return db.query(Category).all()


# ── Product ───────────────────────────────────────────────────────────────────

def _build_product_out(db: Session, product: Product) -> ProductOut:
    levels = (
        db.query(StockLevel, Warehouse.name)
        .join(Warehouse, StockLevel.warehouse_id == Warehouse.id)
        .filter(StockLevel.product_id == product.id)
        .all()
    )
    stock_levels = [
        StockLevelOut(
            warehouse_id=sl.warehouse_id,
            warehouse_name=wh_name,
            quantity=sl.quantity,
        )
        for sl, wh_name in levels
    ]
    total = sum(s.quantity for s in stock_levels)
    return ProductOut(
        id=product.id,
        name=product.name,
        sku=product.sku,
        category_id=product.category_id,
        category_name=product.category.name if product.category else None,
        unit_of_measure=product.unit_of_measure,
        low_stock_threshold=product.low_stock_threshold,
        is_active=product.is_active,
        total_stock=total,
        stock_levels=stock_levels,
    )


def create_product(db: Session, data: ProductIn, created_by: User) -> ProductOut:
    if db.query(Product).filter(Product.sku == data.sku).first():
        raise HTTPException(status_code=409, detail="A product with this SKU already exists")

    product = Product(
        name=data.name,
        sku=data.sku,
        category_id=data.category_id,
        unit_of_measure=data.unit_of_measure,
        low_stock_threshold=data.low_stock_threshold,
    )
    db.add(product)
    db.flush()

    # Seed initial stock if provided
    if data.initial_stock and data.initial_stock > 0:
        warehouse_id = data.warehouse_id
        if not warehouse_id:
            # Use first available warehouse
            wh = db.query(Warehouse).filter(Warehouse.is_active == True).first()
            if wh:
                warehouse_id = wh.id

        if warehouse_id:
            _apply_delta(
                db, product.id, warehouse_id, data.initial_stock,
                "adjustment", None, created_by.id, "Initial stock"
            )

    db.commit()
    db.refresh(product)
    return _build_product_out(db, product)


def list_products(
    db: Session,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    low_stock_only: bool = False,
) -> List[ProductOut]:
    q = db.query(Product).filter(Product.is_active == True)
    if search:
        q = q.filter(Product.name.ilike(f"%{search}%") | Product.sku.ilike(f"%{search}%"))
    if category_id:
        q = q.filter(Product.category_id == category_id)
    products = q.all()

    result = [_build_product_out(db, p) for p in products]
    if low_stock_only:
        result = [p for p in result if p.total_stock <= p.low_stock_threshold]
    return result


def get_product_or_404(db: Session, product_id: int) -> ProductOut:
    p = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return _build_product_out(db, p)


def update_product(db: Session, product_id: int, data: ProductUpdate) -> ProductOut:
    p = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    if data.name is not None:
        p.name = data.name
    if data.category_id is not None:
        p.category_id = data.category_id
    if data.unit_of_measure is not None:
        p.unit_of_measure = data.unit_of_measure
    if data.low_stock_threshold is not None:
        p.low_stock_threshold = data.low_stock_threshold
    db.commit()
    db.refresh(p)
    return _build_product_out(db, p)


def delete_product(db: Session, product_id: int) -> None:
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    p.is_active = False
    db.commit()


# ── Move Documents ────────────────────────────────────────────────────────────

def create_move_document(
    db: Session, data: MoveDocumentIn, created_by: User
) -> MoveDocument:
    doc = MoveDocument(
        reference=_next_reference(db, data.move_type),
        move_type=data.move_type,
        status=DocStatus.draft,
        supplier_or_customer=data.supplier_or_customer,
        notes=data.notes,
        source_warehouse_id=data.source_warehouse_id,
        dest_warehouse_id=data.dest_warehouse_id,
        created_by_id=created_by.id,
    )
    db.add(doc)
    db.flush()

    for line_in in data.lines:
        line = MoveLine(
            document_id=doc.id,
            product_id=line_in.product_id,
            qty_demand=line_in.qty_demand,
        )
        db.add(line)

    db.commit()
    db.refresh(doc)
    return doc


def list_move_documents(
    db: Session,
    move_type: Optional[str] = None,
    status: Optional[str] = None,
    warehouse_id: Optional[int] = None,
) -> List[MoveDocument]:
    q = db.query(MoveDocument)
    if move_type:
        q = q.filter(MoveDocument.move_type == move_type)
    if status:
        q = q.filter(MoveDocument.status == status)
    if warehouse_id:
        q = q.filter(
            (MoveDocument.source_warehouse_id == warehouse_id) |
            (MoveDocument.dest_warehouse_id == warehouse_id)
        )
    return q.order_by(MoveDocument.created_at.desc()).all()


def get_document_or_404(db: Session, doc_id: int) -> MoveDocument:
    doc = db.query(MoveDocument).filter(MoveDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


def update_move_document(
    db: Session, doc_id: int, data: MoveDocumentUpdate
) -> MoveDocument:
    doc = get_document_or_404(db, doc_id)
    if doc.status == DocStatus.done:
        raise HTTPException(status_code=400, detail="Cannot edit a validated document")

    if data.supplier_or_customer is not None:
        doc.supplier_or_customer = data.supplier_or_customer
    if data.notes is not None:
        doc.notes = data.notes

    if data.lines is not None:
        # Replace all lines
        for line in doc.lines:
            db.delete(line)
        db.flush()
        for line_in in data.lines:
            line = MoveLine(
                document_id=doc.id,
                product_id=line_in.product_id,
                qty_demand=line_in.qty_demand,
            )
            db.add(line)

    db.commit()
    db.refresh(doc)
    return doc


def validate_document(db: Session, doc_id: int, current_user: User) -> MoveDocument:
    """
    Validate a document: update stock levels and write ledger entries.
    Receipt    → dest_warehouse gets stock
    Delivery   → source_warehouse loses stock
    Transfer   → source loses, dest gains
    Adjustment → dest_warehouse quantity set to qty_demand (correction)
    """
    doc = get_document_or_404(db, doc_id)

    if doc.status == DocStatus.done:
        raise HTTPException(status_code=400, detail="Document is already validated")
    if doc.status == DocStatus.cancelled:
        raise HTTPException(status_code=400, detail="Cannot validate a cancelled document")

    for line in doc.lines:
        line.qty_done = line.qty_demand  # simple 1-step validation

        if doc.move_type == MoveType.receipt:
            wh_id = doc.dest_warehouse_id
            if not wh_id:
                raise HTTPException(status_code=400, detail="Destination warehouse required for receipts")
            _apply_delta(db, line.product_id, wh_id, +line.qty_done, "receipt", doc.id, current_user.id)

        elif doc.move_type == MoveType.delivery:
            wh_id = doc.source_warehouse_id
            if not wh_id:
                raise HTTPException(status_code=400, detail="Source warehouse required for deliveries")
            _apply_delta(db, line.product_id, wh_id, -line.qty_done, "delivery", doc.id, current_user.id)

        elif doc.move_type == MoveType.transfer:
            if not doc.source_warehouse_id or not doc.dest_warehouse_id:
                raise HTTPException(status_code=400, detail="Both source and destination warehouses required for transfers")
            _apply_delta(db, line.product_id, doc.source_warehouse_id, -line.qty_done, "transfer", doc.id, current_user.id)
            _apply_delta(db, line.product_id, doc.dest_warehouse_id,   +line.qty_done, "transfer", doc.id, current_user.id)

        elif doc.move_type == MoveType.adjustment:
            wh_id = doc.dest_warehouse_id or doc.source_warehouse_id
            if not wh_id:
                raise HTTPException(status_code=400, detail="A warehouse is required for adjustments")
            sl = _get_or_create_stock(db, line.product_id, wh_id)
            delta = line.qty_done - sl.quantity   # correction delta
            _apply_delta(db, line.product_id, wh_id, delta, "adjustment", doc.id, current_user.id, "Stock adjustment")

    doc.status = DocStatus.done
    doc.validated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(doc)
    return doc


def cancel_document(db: Session, doc_id: int) -> MoveDocument:
    doc = get_document_or_404(db, doc_id)
    if doc.status == DocStatus.done:
        raise HTTPException(status_code=400, detail="Cannot cancel an already validated document")
    doc.status = DocStatus.cancelled
    db.commit()
    db.refresh(doc)
    return doc


# ── Ledger / History ──────────────────────────────────────────────────────────

def list_ledger(
    db: Session,
    product_id: Optional[int] = None,
    warehouse_id: Optional[int] = None,
    move_type: Optional[str] = None,
    limit: int = 200,
) -> List[StockLedger]:
    q = db.query(StockLedger)
    if product_id:
        q = q.filter(StockLedger.product_id == product_id)
    if warehouse_id:
        q = q.filter(StockLedger.warehouse_id == warehouse_id)
    if move_type:
        q = q.filter(StockLedger.move_type == move_type)
    return q.order_by(StockLedger.created_at.desc()).limit(limit).all()


# ── Dashboard KPIs ────────────────────────────────────────────────────────────

def get_dashboard(db: Session) -> dict:
    total_products = db.query(func.count(Product.id)).filter(Product.is_active == True).scalar()

    products = db.query(Product).filter(Product.is_active == True).all()
    low_stock = 0
    out_of_stock = 0
    for p in products:
        total_qty = db.query(func.coalesce(func.sum(StockLevel.quantity), 0)).filter(
            StockLevel.product_id == p.id
        ).scalar()
        if total_qty == 0:
            out_of_stock += 1
        elif total_qty <= p.low_stock_threshold:
            low_stock += 1

    pending_receipts = db.query(func.count(MoveDocument.id)).filter(
        MoveDocument.move_type == "receipt",
        MoveDocument.status.in_(["draft", "waiting", "ready"]),
    ).scalar()

    pending_deliveries = db.query(func.count(MoveDocument.id)).filter(
        MoveDocument.move_type == "delivery",
        MoveDocument.status.in_(["draft", "waiting", "ready"]),
    ).scalar()

    pending_transfers = db.query(func.count(MoveDocument.id)).filter(
        MoveDocument.move_type == "transfer",
        MoveDocument.status.in_(["draft", "waiting", "ready"]),
    ).scalar()

    return {
        "total_products": total_products,
        "low_stock_count": low_stock,
        "out_of_stock_count": out_of_stock,
        "pending_receipts": pending_receipts,
        "pending_deliveries": pending_deliveries,
        "pending_transfers": pending_transfers,
    }
