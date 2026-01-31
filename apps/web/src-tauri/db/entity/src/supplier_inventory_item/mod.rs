pub mod dto;

use super::id::Id;
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// Supplier-Inventory Item junction table - many-to-many relationship
/// Tracks which suppliers can provide which medicines
/// Optimized for PostgreSQL with native types
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "supplier_inventory_items")]
pub struct Model {
    /// Primary key - PostgreSQL UUID type
    #[sea_orm(primary_key, auto_increment = false, column_type = "Uuid")]
    pub id: Id,

    /// Supplier ID - foreign key to suppliers table
    #[sea_orm(column_type = "Uuid")]
    pub supplier_id: Id,

    /// Inventory item ID - foreign key to inventory_items table
    #[sea_orm(column_type = "Uuid")]
    pub inventory_item_id: Id,

    /// Supplier's price for this item - DECIMAL(10,2)
    #[sea_orm(column_type = "Decimal(Some((10, 2)))")]
    pub supplier_price: Decimal,

    /// Average delivery time in days - INTEGER
    #[sea_orm(column_type = "Integer")]
    pub delivery_days: i32,

    /// Minimum order quantity - INTEGER (nullable)
    #[sea_orm(column_type = "Integer", nullable)]
    pub min_order_quantity: Option<i32>,

    /// Whether this is the preferred supplier for this item - BOOLEAN
    pub is_preferred: bool,

    /// Whether this supplier-item relationship is active - BOOLEAN
    pub is_active: bool,

    /// Last order date from this supplier for this item - DATE (nullable)
    #[sea_orm(nullable)]
    pub last_order_date: Option<Date>,

    /// Notes specific to this supplier-item relationship - TEXT (nullable)
    #[sea_orm(column_type = "Text", nullable)]
    pub notes: Option<String>,

    // === Audit & Compliance ===
    /// User who created this relationship - UUID (nullable)
    #[sea_orm(column_type = "Uuid", nullable)]
    pub created_by: Option<Id>,

    /// User who last modified this relationship - UUID (nullable)
    #[sea_orm(column_type = "Uuid", nullable)]
    pub updated_by: Option<Id>,

    /// Record creation timestamp - PostgreSQL TIMESTAMPTZ
    #[sea_orm(column_type = "TimestampWithTimeZone")]
    pub created_at: DateTimeWithTimeZone,

    /// Last update timestamp - PostgreSQL TIMESTAMPTZ (auto-updated)
    #[sea_orm(column_type = "TimestampWithTimeZone")]
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// Many-to-one: Relationship belongs to one supplier
    #[sea_orm(
        belongs_to = "super::supplier::Entity",
        from = "Column::SupplierId",
        to = "super::supplier::Column::Id"
    )]
    Supplier,

    /// Many-to-one: Relationship belongs to one inventory item
    #[sea_orm(
        belongs_to = "super::inventory_item::Entity",
        from = "Column::InventoryItemId",
        to = "super::inventory_item::Column::Id"
    )]
    InventoryItem,
}

impl Related<super::supplier::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Supplier.def()
    }
}

impl Related<super::inventory_item::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::InventoryItem.def()
    }
}

#[async_trait::async_trait]
impl ActiveModelBehavior for ActiveModel {
    /// Called before insert - generate ID and set timestamps
    fn new() -> Self {
        Self {
            id: sea_orm::ActiveValue::Set(Id::new()),
            is_preferred: sea_orm::ActiveValue::Set(false),
            is_active: sea_orm::ActiveValue::Set(true),
            created_at: sea_orm::ActiveValue::Set(chrono::Utc::now().into()),
            updated_at: sea_orm::ActiveValue::Set(chrono::Utc::now().into()),
            ..Default::default()
        }
    }

    /// Called before save - update timestamp on modifications
    async fn before_save<C>(mut self, _db: &C, insert: bool) -> Result<Self, DbErr>
    where
        C: ConnectionTrait,
    {
        if !insert {
            self.updated_at = sea_orm::ActiveValue::Set(chrono::Utc::now().into());
        }
        Ok(self)
    }
}
