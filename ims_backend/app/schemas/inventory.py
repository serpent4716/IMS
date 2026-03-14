# app/schemas/inventory.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ── Warehouse ────────────────────────────────────────────────────────────────

class WarehouseIn(BaseModel):
    name: str
    location: Optional[str] = None


class WarehouseOut(BaseModel):
    id: int
    name: str
    location: Optional[str]
    is_active: bool
    model_config = {"from_attributes": True}


# ── Category ─────────────────────────────────────────────────────────────────

class CategoryIn(BaseModel):
    name: str


class CategoryOut(BaseModel):
    id: int
    name: str
    model_config = {"from_attributes": True}


# ── Product ──────────────────────────────────────────────────────────────────

class ProductIn(BaseModel):
    name: str
    sku: str
    category_id: Optional[int] = None
    unit_of_measure: str = "pcs"
    low_stock_threshold: float = 10
    initial_stock: float = 0          # convenience – added to default warehouse on create
    warehouse_id: Optional[int] = None  # where to put initial stock


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    unit_of_measure: Optional[str] = None
    low_stock_threshold: Optional[float] = None


class StockLevelOut(BaseModel):
    warehouse_id: int
    warehouse_name: str
    quantity: float
    model_config = {"from_attributes": True}


class ProductOut(BaseModel):
    id: int
    name: str
    sku: str
    category_id: Optional[int]
    category_name: Optional[str]
    unit_of_measure: str
    low_stock_threshold: float
    is_active: bool
    total_stock: float
    stock_levels: List[StockLevelOut] = []
    model_config = {"from_attributes": True}


# ── Move Documents ────────────────────────────────────────────────────────────

class MoveLineIn(BaseModel):
    product_id: int
    qty_demand: float


class MoveLineOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_sku: str
    qty_demand: float
    qty_done: float
    model_config = {"from_attributes": True}


class MoveDocumentIn(BaseModel):
    move_type: str          # receipt | delivery | transfer | adjustment
    supplier_or_customer: Optional[str] = None
    notes: Optional[str] = None
    source_warehouse_id: Optional[int] = None
    dest_warehouse_id: Optional[int] = None
    lines: List[MoveLineIn] = []


class MoveDocumentUpdate(BaseModel):
    supplier_or_customer: Optional[str] = None
    notes: Optional[str] = None
    lines: Optional[List[MoveLineIn]] = None


class MoveDocumentOut(BaseModel):
    id: int
    reference: str
    move_type: str
    status: str
    supplier_or_customer: Optional[str]
    notes: Optional[str]
    source_warehouse_id: Optional[int]
    dest_warehouse_id: Optional[int]
    created_by_id: int
    validated_at: Optional[datetime]
    created_at: datetime
    lines: List[MoveLineOut] = []
    model_config = {"from_attributes": True}


# ── Ledger ────────────────────────────────────────────────────────────────────

class LedgerOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    warehouse_id: int
    warehouse_name: str
    move_type: str
    delta: float
    qty_after: float
    note: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Dashboard KPIs ────────────────────────────────────────────────────────────

class DashboardOut(BaseModel):
    total_products: int
    low_stock_count: int
    out_of_stock_count: int
    pending_receipts: int
    pending_deliveries: int
    pending_transfers: int
