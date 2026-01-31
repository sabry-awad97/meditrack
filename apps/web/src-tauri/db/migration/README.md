# Database Migrations

This crate contains SeaORM migrations for the PostgreSQL database schema.

## Overview

The migrations create a complete database schema for the pharmacy management system with:

- **ENUM types** for type-safe status fields
- **User Management**: Staff, Roles, and Users tables
- **Customer Management**: Customer records
- **Inventory Management**: Medicine catalog
- **Order Management**: Special orders and order items
- **Supplier Management**: Suppliers and supplier-inventory relationships
- **System Configuration**: Application settings
- **Comprehensive indexes** for query performance (included in each migration)
- **Soft deletion** support
- **Audit trails** with created_by/updated_by fields
- **Timezone-aware timestamps**
- **Auto-updating timestamps** via triggers

## Migration Files

1. **m20250130_000001_create_enums.rs**
   - Creates PostgreSQL ENUM types:
     - `employment_status`: active, on_leave, terminated
     - `work_schedule`: full_time, part_time, contract
     - `user_status`: active, inactive, suspended, pending_verification
     - `special_order_status`: pending, ordered, arrived, ready_for_pickup, delivered, cancelled

2. **m20250130_000002_create_staff_table.rs**
   - Creates `staff` table with all employee fields
   - Adds trigger for auto-updating `updated_at` timestamp
   - Uses PostgreSQL native types (UUID, TEXT, VARCHAR, NUMERIC, TIMESTAMPTZ)

3. **m20250130_000003_create_roles_table.rs**
   - Creates `roles` table for permission management
   - Adds trigger for auto-updating `updated_at` timestamp
   - Seeds default system roles (admin, manager, pharmacist, technician, viewer)
   - Uses JSONB for flexible permissions storage

4. **m20250130_000004_create_users_table.rs**
   - Creates `users` table with authentication fields
   - Adds foreign keys to staff and roles tables
   - Supports self-referential supervisor relationship
   - Adds trigger for auto-updating `updated_at` timestamp

5. **m20250131_000001_create_customers_table.rs**
   - Creates `customers` table for customer records
   - Includes indexes for full_name, phone_number, email, national_id, is_active
   - Partial index for active customers (soft delete)
   - Adds trigger for auto-updating `updated_at` timestamp

6. **m20250131_000002_create_inventory_items_table.rs**
   - Creates `inventory_items` table for medicine catalog
   - Includes indexes for name, generic_name, form, is_active
   - Partial indexes for low stock items and active items
   - Adds trigger for auto-updating `updated_at` timestamp

7. **m20250131_000003_create_suppliers_table.rs**
   - Creates `suppliers` table for supplier information
   - Includes indexes for name, rating, is_active
   - GIN index for JSONB common_medicines field
   - Partial index for active suppliers
   - Adds trigger for auto-updating `updated_at` timestamp

8. **m20250131_000004_create_special_orders_table.rs**
   - Creates `special_orders` table for special medicine orders
   - Foreign keys to customers and suppliers
   - Includes indexes for customer_id, supplier_id, order_number, status, order_date
   - Partial index for active orders
   - Adds trigger for auto-updating `updated_at` timestamp

9. **m20250131_000005_create_special_order_items_table.rs**
   - Creates `special_order_items` junction table for order line items
   - Foreign keys to special_orders and inventory_items
   - Includes indexes for special_order_id and inventory_item_id
   - Supports custom items (not in catalog)
   - Adds trigger for auto-updating `updated_at` timestamp

10. **m20250131_000006_create_supplier_inventory_items_table.rs**
    - Creates `supplier_inventory_items` junction table for supplier-medicine relationships
    - Foreign keys to suppliers and inventory_items
    - Includes indexes for supplier_id, inventory_item_id, is_preferred, is_active
    - Composite unique index to prevent duplicate relationships
    - Adds trigger for auto-updating `updated_at` timestamp

11. **m20250131_000007_create_settings_table.rs**
    - Creates `settings` table for application configuration
    - Key-value pairs with JSONB values
    - Includes index for category
    - Adds trigger for auto-updating `updated_at` timestamp

## Prerequisites

1. **PostgreSQL Database**
   - PostgreSQL 12 or higher
   - Database created and accessible

2. **Environment Variables**
   - Set `DATABASE_URL` environment variable:
     ```bash
     export DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
     ```

## Running Migrations

### Apply All Migrations

```bash
# From the migration directory
cd apps/web/src-tauri/db/migration

# Run migrations
cargo run -- up

# Or using the binary name
cargo run --bin migration -- up
```

### Check Migration Status

```bash
cargo run -- status
```

### Rollback Last Migration

```bash
cargo run -- down
```

### Rollback All Migrations

```bash
cargo run -- fresh
```

### Generate New Migration

```bash
cargo run -- generate <migration_name>
```

## Migration Commands

| Command           | Description                                |
| ----------------- | ------------------------------------------ |
| `up`              | Apply all pending migrations               |
| `up -n <num>`     | Apply the next `num` pending migrations    |
| `down`            | Rollback the last applied migration        |
| `down -n <num>`   | Rollback the last `num` applied migrations |
| `status`          | Check the status of all migrations         |
| `fresh`           | Drop all tables and reapply all migrations |
| `refresh`         | Rollback all migrations and reapply them   |
| `reset`           | Rollback all migrations                    |
| `generate <name>` | Generate a new migration file              |

## Database Schema

### Tables Created

#### User Management

1. **staff** - Employee records with HR information
2. **roles** - Role definitions with JSONB permissions
3. **users** - User accounts linked to staff

#### Customer & Inventory

4. **customers** - Customer records for orders
5. **inventory_items** - Medicine catalog with stock management

#### Orders

6. **special_orders** - Special medicine orders
7. **special_order_items** - Order line items (junction table)

#### Suppliers

8. **suppliers** - Supplier information and performance tracking
9. **supplier_inventory_items** - Supplier-medicine relationships (junction table)

#### Configuration

10. **settings** - Application settings (key-value pairs)

### Relationships

```
%% User Management
staff (1) ←→ (0..1) users
users (N) ←→ (1) roles
users (N) ←→ (0..1) users (supervisor)

%% Customer & Orders
customers (1) ←→ (N) special_orders
suppliers (1) ←→ (N) special_orders
special_orders (1) ←→ (N) special_order_items
inventory_items (1) ←→ (N) special_order_items

%% Supplier-Inventory Relationship
suppliers (N) ←→ (N) inventory_items (through supplier_inventory_items)
```

### Default Roles

The migration seeds 5 default system roles:

| Role       | Level | Permissions                                                 |
| ---------- | ----- | ----------------------------------------------------------- |
| admin      | 100   | Full system access (\*)                                     |
| manager    | 75    | orders:_, inventory:_, reports:\*, staff:read, staff:update |
| pharmacist | 50    | orders:\*, inventory:read, inventory:update, reports:read   |
| technician | 30    | orders:create, orders:read, orders:update, inventory:read   |
| viewer     | 10    | orders:read, reports:read                                   |

## Indexes Created

All indexes are created within each migration file (not in a separate indexes migration).

### Staff Table Indexes

- `idx_staff_employee_id` - Employee ID lookups
- `idx_staff_employment_status` - Filter by employment status
- `idx_staff_department` - Department-based queries
- `idx_staff_position` - Position-based queries
- `idx_staff_email` - Email lookups
- `idx_staff_active` - Partial index for non-deleted records
- `idx_staff_employment_active` - Composite index for active staff

### Roles Table Indexes

- `idx_roles_name` - Role name lookups
- `idx_roles_level` - Permission hierarchy queries
- `idx_roles_is_active` - Filter active roles
- `idx_roles_permissions` - GIN index for JSONB queries
- `idx_roles_active` - Partial index for non-deleted records
- `idx_roles_system_active` - Composite index for system roles

### Users Table Indexes

- `idx_users_staff_id` - Staff relationship lookups
- `idx_users_username` - Login username lookups
- `idx_users_email` - Login email lookups
- `idx_users_role_id` - Role-based queries
- `idx_users_supervisor_id` - Organizational hierarchy
- `idx_users_status` - Filter by user status
- `idx_users_is_active` - Filter active users
- `idx_users_last_login_at` - Activity tracking
- `idx_users_active` - Partial index for non-deleted records
- `idx_users_status_active` - Composite index for active users
- `idx_users_role_active` - Composite index for role-based queries

### Customers Table Indexes

- `idx_customers_full_name` - Customer name lookups
- `idx_customers_phone_number` - Phone number lookups
- `idx_customers_email` - Email lookups
- `idx_customers_national_id` - National ID lookups
- `idx_customers_is_active` - Filter active customers
- `idx_customers_active` - Partial index for non-deleted records

### Inventory Items Table Indexes

- `idx_inventory_items_name` - Medicine name lookups
- `idx_inventory_items_generic_name` - Generic name lookups
- `idx_inventory_items_form` - Dosage form filtering
- `idx_inventory_items_is_active` - Filter active items
- `idx_inventory_items_low_stock` - Partial index for low stock items
- `idx_inventory_items_active` - Partial index for non-deleted records

### Suppliers Table Indexes

- `idx_suppliers_name` - Supplier name lookups
- `idx_suppliers_rating` - Rating-based queries
- `idx_suppliers_is_active` - Filter active suppliers
- `idx_suppliers_active` - Partial index for non-deleted records

### Special Orders Table Indexes

- `idx_special_orders_customer_id` - Customer relationship lookups
- `idx_special_orders_supplier_id` - Supplier relationship lookups
- `idx_special_orders_order_number` - Order number lookups
- `idx_special_orders_status` - Status filtering
- `idx_special_orders_order_date` - Date-based queries
- `idx_special_orders_active` - Partial index for non-deleted records

### Special Order Items Table Indexes

- `idx_special_order_items_order_id` - Order relationship lookups
- `idx_special_order_items_inventory_id` - Inventory relationship lookups

### Supplier Inventory Items Table Indexes

- `idx_supplier_inventory_items_supplier_id` - Supplier relationship lookups
- `idx_supplier_inventory_items_inventory_id` - Inventory relationship lookups
- `idx_supplier_inventory_items_is_preferred` - Preferred supplier filtering
- `idx_supplier_inventory_items_is_active` - Active relationship filtering
- `idx_supplier_inventory_items_unique` - Composite unique index (supplier_id, inventory_item_id)

### Settings Table Indexes

- `idx_settings_category` - Category-based filtering

## Auto-Update Triggers

All tables have triggers that automatically update the `updated_at` timestamp:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

## Soft Deletion

All tables support soft deletion via the `deleted_at` field:

- `deleted_at IS NULL` - Active record
- `deleted_at IS NOT NULL` - Soft-deleted record

Partial indexes are created to optimize queries for active records:

```sql
CREATE INDEX idx_staff_active
ON staff(id)
WHERE deleted_at IS NULL;
```

## Foreign Key Constraints

### Users → Staff

- **ON DELETE**: RESTRICT (cannot delete staff with active user)
- **ON UPDATE**: CASCADE (updates propagate)

### Users → Roles

- **ON DELETE**: RESTRICT (cannot delete role with active users)
- **ON UPDATE**: CASCADE (updates propagate)

### Users → Users (Supervisor)

- **ON DELETE**: SET NULL (supervisor deletion sets field to NULL)
- **ON UPDATE**: CASCADE (updates propagate)

## PostgreSQL Features Used

1. **UUID Type** - Native UUID storage
2. **ENUM Types** - Type-safe status fields
3. **TIMESTAMPTZ** - Timezone-aware timestamps
4. **JSONB** - Binary JSON with indexing
5. **TEXT** - Unlimited length text
6. **VARCHAR(N)** - Constrained text fields
7. **NUMERIC(P,S)** - Precise decimal arithmetic
8. **GIN Indexes** - Efficient JSONB queries
9. **Partial Indexes** - Optimized soft-delete queries
10. **Triggers** - Auto-update timestamps

## Troubleshooting

### Migration Fails

1. **Check database connection**:

   ```bash
   psql $DATABASE_URL
   ```

2. **Check migration status**:

   ```bash
   cargo run -- status
   ```

3. **View detailed error**:
   ```bash
   RUST_LOG=debug cargo run -- up
   ```

### Reset Database

To completely reset the database:

```bash
# Drop all tables and reapply migrations
cargo run -- fresh

# Or manually drop and recreate
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
cargo run -- up
```

### Check Applied Migrations

```sql
SELECT * FROM seaql_migrations ORDER BY version;
```

## Development Workflow

1. **Create new migration**:

   ```bash
   cargo run -- generate add_new_field
   ```

2. **Edit migration file** in `src/`

3. **Test migration**:

   ```bash
   cargo run -- up
   ```

4. **Test rollback**:

   ```bash
   cargo run -- down
   ```

5. **Verify schema**:
   ```bash
   psql $DATABASE_URL -c "\d+ staff"
   ```

## Integration with Application

To use migrations in your application:

```rust
use sea_orm_migration::prelude::*;
use db_migration::Migrator;

// Run migrations on startup
Migrator::up(&db, None).await?;

// Check migration status
let status = Migrator::status(&db).await?;
```

## Best Practices

1. **Never modify applied migrations** - Create new migrations instead
2. **Test rollbacks** - Ensure `down()` works correctly
3. **Use transactions** - Migrations run in transactions by default
4. **Backup before production** - Always backup before running migrations
5. **Test on staging** - Test migrations on staging environment first
6. **Document changes** - Add comments explaining complex migrations
7. **Keep migrations small** - One logical change per migration
8. **Version control** - Commit migrations with code changes

## Files Structure

```
db/migration/
├── Cargo.toml                                                # Migration crate config
├── README.md                                                 # This file
├── QUICK_START.md                                            # Quick start guide
└── src/
    ├── lib.rs                                                # Migration registry
    ├── main.rs                                               # CLI binary
    ├── m20250130_000001_create_enums.rs                     # ENUM types
    ├── m20250130_000002_create_staff_table.rs               # Staff table
    ├── m20250130_000003_create_roles_table.rs               # Roles table
    ├── m20250130_000004_create_users_table.rs               # Users table
    ├── m20250131_000001_create_customers_table.rs           # Customers table
    ├── m20250131_000002_create_inventory_items_table.rs     # Inventory items table
    ├── m20250131_000003_create_suppliers_table.rs           # Suppliers table
    ├── m20250131_000004_create_special_orders_table.rs      # Special orders table
    ├── m20250131_000005_create_special_order_items_table.rs # Special order items table
    ├── m20250131_000006_create_supplier_inventory_items_table.rs # Supplier-inventory junction
    └── m20250131_000007_create_settings_table.rs            # Settings table
```

## Next Steps

After running migrations:

1. **Verify schema**: Check that all tables and indexes were created
2. **Test queries**: Run sample queries to verify performance
3. **Implement service layer**: Create CRUD operations using entities
4. **Add seed data**: Create additional test data if needed
5. **Set up backups**: Configure automated database backups

## Resources

- [SeaORM Migration Documentation](https://www.sea-ql.org/SeaORM/docs/migration/setting-up-migration/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Entity Model Documentation](../entity/ENTITY_MODEL.md)
- [PostgreSQL Optimization Guide](../entity/POSTGRESQL_OPTIMIZATION.md)
