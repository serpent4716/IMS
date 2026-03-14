# app/models/inventory.py
from datetime import datetime, timezone
from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey,
    Integer, String, Text, Enum
)
from sqlalchemy.orm import relationship
import enum

from app.db.session import Base


class MoveType(str, enum.Enum):
    receipt = "receipt"
    delivery = "delivery"
    transfer = "transfer"
    adjustment = "adjustment"


class DocStatus(str, enum.Enum):
    draft = "draft"
    waiting = "waiting"
    ready = "ready"
    done = "done"
    cancelled = "cancelled"


# ── Warehouse ────────────────────────────────────────────────────────────────

class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False, unique=True)
    location = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    stock_levels = relationship("StockLevel", back_populates="warehouse")


# ── Product Category ─────────────────────────────────────────────────────────

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)

    products = relationship("Product", back_populates="category")


# ── Product ──────────────────────────────────────────────────────────────────

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    unit_of_measure = Column(String(50), default="pcs")
    low_stock_threshold = Column(Float, default=10)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    category = relationship("Category", back_populates="products")
    stock_levels = relationship("StockLevel", back_populates="product")
    move_lines = relationship("MoveLine", back_populates="product")


# ── Stock Level (per product per warehouse) ──────────────────────────────────

class StockLevel(Base):
    __tablename__ = "stock_levels"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    quantity = Column(Float, default=0)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    product = relationship("Product", back_populates="stock_levels")
    warehouse = relationship("Warehouse", back_populates="stock_levels")


# ── Move Document (Receipt / Delivery / Transfer / Adjustment header) ─────────

class MoveDocument(Base):
    __tablename__ = "move_documents"

    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String(60), unique=True, index=True)  # e.g. REC/2024/0001
    move_type = Column(String(30), nullable=False)           # MoveType enum value
    status = Column(String(30), default=DocStatus.draft)
    supplier_or_customer = Column(String(200))               # free-text name
    notes = Column(Text)
    source_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    dest_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    validated_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    source_warehouse = relationship("Warehouse", foreign_keys=[source_warehouse_id])
    dest_warehouse = relationship("Warehouse", foreign_keys=[dest_warehouse_id])
    created_by = relationship("User")
    lines = relationship("MoveLine", back_populates="document", cascade="all, delete-orphan")


# ── Move Line (individual product line in a document) ────────────────────────

class MoveLine(Base):
    __tablename__ = "move_lines"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("move_documents.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    qty_demand = Column(Float, default=0)   # planned quantity
    qty_done = Column(Float, default=0)     # actual done quantity

    document = relationship("MoveDocument", back_populates="lines")
    product = relationship("Product", back_populates="move_lines")


# ── Stock Ledger (immutable log of every stock change) ───────────────────────

class StockLedger(Base):
    __tablename__ = "stock_ledger"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("move_documents.id"), nullable=True)
    move_type = Column(String(30), nullable=False)
    delta = Column(Float, nullable=False)           # positive = in, negative = out
    qty_after = Column(Float, nullable=False)        # running balance
    note = Column(String(255))
    created_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    product = relationship("Product")
    warehouse = relationship("Warehouse")
    document = relationship("MoveDocument")
    created_by = relationship("User")
