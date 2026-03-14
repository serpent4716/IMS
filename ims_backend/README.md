# CoreInventory — FastAPI Backend

A complete Inventory Management System backend built with FastAPI + SQLAlchemy + SQLite.

---

## Project Structure

```
ims_backend/
├── app/
│   ├── main.py                  # FastAPI app, CORS, router registration
│   ├── core/
│   │   ├── config.py            # Settings (reads from .env)
│   │   ├── security.py          # Password hashing, JWT, OTP generation
│   │   ├── email.py             # OTP email sender (prints to terminal in dev)
│   │   └── deps.py              # FastAPI dependency injection (auth guards)
│   ├── db/
│   │   └── session.py           # SQLAlchemy engine + session + Base
│   ├── models/
│   │   ├── user.py              # User, OTPRecord tables
│   │   └── inventory.py         # Warehouse, Category, Product, StockLevel,
│   │                            #   MoveDocument, MoveLine, StockLedger
│   ├── schemas/
│   │   ├── auth.py              # Register/Login/Token/ForgotPassword/Reset schemas
│   │   ├── user.py              # UpdateProfile, ChangePassword schemas
│   │   └── inventory.py         # All inventory Pydantic schemas + Dashboard
│   ├── services/
│   │   ├── auth_service.py      # register, login, OTP send/verify
│   │   └── inventory_service.py # CRUD for warehouses, products, documents, ledger, KPIs
│   └── api/routes/
│       ├── auth.py              # POST /auth/register, /login, /forgot-password, /reset-password
│       │                        # GET  /auth/me
│       ├── users.py             # PATCH /users/me, POST /users/me/change-password
│       ├── warehouses.py        # CRUD /warehouses
│       ├── products.py          # CRUD /products + /products/categories
│       ├── operations.py        # CRUD /operations + validate/cancel actions
│       ├── history.py           # GET /history (stock ledger)
│       └── dashboard.py         # GET /dashboard (KPIs)
├── requirements.txt
├── .env.example
└── README.md
```

---

## Quick Start

### 1. Install Python 3.11+

### 2. Create a virtual environment

```bash
cd ims_backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment

```bash
cp .env.example .env
# Edit .env if needed — defaults work for local dev
```

### 5. Run the server

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The database (`ims.db`) and all tables are created automatically on first startup.

### 6. Open API docs

- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc:       http://127.0.0.1:8000/redoc

---

## API Reference

All endpoints are prefixed with `/api/v1`.

### Auth

| Method | Endpoint                    | Auth? | Description                         |
|--------|-----------------------------|-------|-------------------------------------|
| POST   | `/auth/register`            | No    | Create account → returns JWT        |
| POST   | `/auth/login`               | No    | Login → returns JWT                 |
| GET    | `/auth/me`                  | Yes   | Get current user profile            |
| POST   | `/auth/forgot-password`     | No    | Send OTP to email (or terminal)     |
| POST   | `/auth/reset-password`      | No    | Verify OTP + set new password       |

**Register body:**
```json
{ "full_name": "Jane Doe", "email": "jane@co.com", "password": "secret123", "role": "inventory_manager" }
```
Roles: `inventory_manager` | `warehouse_staff`

**Login body:**
```json
{ "email": "jane@co.com", "password": "secret123" }
```

**Forgot password body:**
```json
{ "email": "jane@co.com" }
```
→ OTP printed to terminal in dev mode.

**Reset password body:**
```json
{ "email": "jane@co.com", "otp": "482910", "new_password": "newpass123" }
```

---

### Users

| Method | Endpoint                       | Auth? | Description               |
|--------|--------------------------------|-------|---------------------------|
| PATCH  | `/users/me`                    | Yes   | Update display name       |
| POST   | `/users/me/change-password`    | Yes   | Change password (current required) |

---

### Warehouses

| Method | Endpoint             | Role     | Description          |
|--------|----------------------|----------|----------------------|
| GET    | `/warehouses/`       | Any      | List warehouses      |
| POST   | `/warehouses/`       | Manager  | Create warehouse     |
| PUT    | `/warehouses/{id}`   | Manager  | Update warehouse     |
| DELETE | `/warehouses/{id}`   | Manager  | Soft-delete          |

---

### Products

| Method | Endpoint                    | Role     | Description             |
|--------|-----------------------------|----------|-------------------------|
| GET    | `/products/`                | Any      | List (search, filter)   |
| POST   | `/products/`                | Manager  | Create product          |
| GET    | `/products/{id}`            | Any      | Get single product      |
| PATCH  | `/products/{id}`            | Manager  | Update product          |
| DELETE | `/products/{id}`            | Manager  | Soft-delete             |
| GET    | `/products/categories`      | Any      | List categories         |
| POST   | `/products/categories`      | Manager  | Create category         |

**Product create body:**
```json
{
  "name": "Steel Rods",
  "sku": "STL-001",
  "category_id": 1,
  "unit_of_measure": "kg",
  "low_stock_threshold": 20,
  "initial_stock": 100,
  "warehouse_id": 1
}
```

**Query params for GET /products/:**
- `search=steel` — name/SKU search
- `category_id=1`
- `low_stock=true` — only items at or below threshold

---

### Operations (Receipts, Deliveries, Transfers, Adjustments)

| Method | Endpoint                        | Auth? | Description                     |
|--------|---------------------------------|-------|---------------------------------|
| GET    | `/operations/`                  | Any   | List documents (filter by type/status/warehouse) |
| POST   | `/operations/`                  | Any   | Create new document             |
| GET    | `/operations/{id}`              | Any   | Get document with lines         |
| PATCH  | `/operations/{id}`              | Any   | Edit draft document             |
| POST   | `/operations/{id}/validate`     | Any   | Validate → updates stock        |
| POST   | `/operations/{id}/cancel`       | Any   | Cancel document                 |

**Create document body:**
```json
{
  "move_type": "receipt",
  "supplier_or_customer": "Acme Corp",
  "dest_warehouse_id": 1,
  "lines": [
    { "product_id": 1, "qty_demand": 50 }
  ]
}
```

`move_type` values: `receipt` | `delivery` | `transfer` | `adjustment`

**Warehouse rules:**
- `receipt`    → needs `dest_warehouse_id`
- `delivery`   → needs `source_warehouse_id`
- `transfer`   → needs both `source_warehouse_id` and `dest_warehouse_id`
- `adjustment` → needs either (use `dest_warehouse_id`)

**Query params for GET /operations/:**
- `move_type=receipt`
- `status=draft` (draft | waiting | ready | done | cancelled)
- `warehouse_id=1`

---

### Move History (Stock Ledger)

| Method | Endpoint      | Auth? | Description                  |
|--------|---------------|-------|------------------------------|
| GET    | `/history/`   | Any   | Immutable log of all changes |

**Query params:**
- `product_id=1`
- `warehouse_id=1`
- `move_type=receipt`
- `limit=200` (max 1000)

---

### Dashboard

| Method | Endpoint        | Auth? | Description    |
|--------|-----------------|-------|----------------|
| GET    | `/dashboard/`   | Any   | KPI snapshot   |

**Response:**
```json
{
  "total_products": 42,
  "low_stock_count": 5,
  "out_of_stock_count": 2,
  "pending_receipts": 3,
  "pending_deliveries": 1,
  "pending_transfers": 4
}
```

---

## How Stock Works

```
Receipt validated    → dest_warehouse stock +qty
Delivery validated   → source_warehouse stock -qty
Transfer validated   → source -qty, dest +qty (total unchanged)
Adjustment validated → warehouse quantity set to qty_demand (corrects mismatches)
```

Every validation writes an immutable row to `stock_ledger`.  
Negative stock is blocked — validating a delivery/transfer with insufficient stock returns HTTP 409.

---

## OTP Password Reset Flow

1. User clicks "Forgot password" → `POST /auth/forgot-password` with email
2. Backend generates a 6-digit OTP, hashes it, stores it with 15-min expiry
3. **Dev mode** (no SMTP configured): OTP is printed to the terminal
4. **Production**: OTP is emailed via SMTP (configure in `.env`)
5. User enters OTP + new password → `POST /auth/reset-password`
6. Backend verifies hashed OTP, marks it used, updates password

Previous unused OTPs for the same email are automatically invalidated when a new one is issued.

---

## Environment Variables

| Variable                    | Default                        | Description                       |
|-----------------------------|--------------------------------|-----------------------------------|
| `SECRET_KEY`                | `dev-secret-key-...`           | JWT signing key (change in prod!) |
| `ALGORITHM`                 | `HS256`                        | JWT algorithm                     |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` (7 days)             | Token lifetime                    |
| `DATABASE_URL`              | `sqlite:///./ims.db`           | SQLAlchemy DB URL                 |
| `SMTP_HOST`                 | *(blank)*                      | SMTP server host                  |
| `SMTP_PORT`                 | `587`                          | SMTP port                         |
| `SMTP_USER`                 | *(blank)*                      | SMTP username                     |
| `SMTP_PASSWORD`             | *(blank)*                      | SMTP password                     |
| `EMAILS_FROM`               | `noreply@coreinventory.com`    | Sender address                    |
| `OTP_EXPIRE_MINUTES`        | `15`                           | OTP validity window               |

Leave SMTP variables blank → OTP prints to terminal (perfect for development).

---

## Switching to PostgreSQL

1. Install `psycopg2-binary`
2. Change `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost/ims_db
   ```
3. Remove the `connect_args` in `db/session.py` (only needed for SQLite)
4. Restart — tables are auto-created on startup

---

## Role Permissions

| Endpoint category        | inventory_manager | warehouse_staff |
|--------------------------|:-----------------:|:---------------:|
| View products/stock      | ✓                 | ✓               |
| Create/edit products     | ✓                 | ✗               |
| Manage warehouses        | ✓                 | ✗               |
| Create/validate operations| ✓                | ✓               |
| View history/dashboard   | ✓                 | ✓               |
