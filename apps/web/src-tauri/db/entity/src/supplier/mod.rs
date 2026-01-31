pub mod dto;

use super::id::Id;
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// Supplier entity - represents medicine suppliers
/// Optimized for PostgreSQL with native types
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "suppliers")]
pub struct Model {
    /// Primary key - PostgreSQL UUID type
    #[sea_orm(primary_key, auto_increment = false, column_type = "Uuid")]
    pub id: Id,

    /// Supplier name - VARCHAR(200)
    #[sea_orm(column_type = "String(StringLen::N(200))")]
    pub name: String,

    /// Contact phone - VARCHAR(20)
    #[sea_orm(column_type = "String(StringLen::N(20))")]
    pub phone: String,

    /// WhatsApp number - VARCHAR(20) (nullable)
    #[sea_orm(column_type = "String(StringLen::N(20))", nullable)]
    pub whatsapp: Option<String>,

    /// Email address - VARCHAR(255) (nullable)
    #[sea_orm(column_type = "String(StringLen::N(255))", nullable)]
    pub email: Option<String>,

    /// Physical address - TEXT (nullable)
    #[sea_orm(column_type = "Text", nullable)]
    pub address: Option<String>,

    /// Supplier rating (1-5) - DECIMAL(2,1)
    #[sea_orm(column_type = "Decimal(Some((2, 1)))")]
    pub rating: Decimal,

    /// Additional notes - TEXT (nullable)
    #[sea_orm(column_type = "Text", nullable)]
    pub notes: Option<String>,

    /// Whether supplier is active - BOOLEAN
    pub is_active: bool,

    // === Audit & Compliance ===
    /// User who created this supplier - UUID (nullable)
    #[sea_orm(column_type = "Uuid", nullable)]
    pub created_by: Option<Id>,

    /// User who last modified this supplier - UUID (nullable)
    #[sea_orm(column_type = "Uuid", nullable)]
    pub updated_by: Option<Id>,

    /// Record creation timestamp - PostgreSQL TIMESTAMPTZ
    #[sea_orm(column_type = "TimestampWithTimeZone")]
    pub created_at: DateTimeWithTimeZone,

    /// Last update timestamp - PostgreSQL TIMESTAMPTZ (auto-updated)
    #[sea_orm(column_type = "TimestampWithTimeZone")]
    pub updated_at: DateTimeWithTimeZone,

    /// Soft deletion timestamp - PostgreSQL TIMESTAMPTZ (nullable)
    #[sea_orm(column_type = "TimestampWithTimeZone", nullable)]
    pub deleted_at: Option<DateTimeWithTimeZone>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// One-to-many: Supplier has many special orders
    #[sea_orm(has_many = "super::special_order::Entity")]
    SpecialOrders,

    /// One-to-many: Supplier has many supplier-inventory item relationships
    #[sea_orm(has_many = "super::supplier_inventory_item::Entity")]
    SupplierInventoryItems,
}

impl Related<super::special_order::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::SpecialOrders.def()
    }
}

impl Related<super::supplier_inventory_item::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::SupplierInventoryItems.def()
    }
}

// Many-to-many relationship with InventoryItem through SupplierInventoryItem
impl Related<super::inventory_item::Entity> for Entity {
    fn to() -> RelationDef {
        super::supplier_inventory_item::Relation::InventoryItem.def()
    }

    fn via() -> Option<RelationDef> {
        Some(
            super::supplier_inventory_item::Relation::Supplier
                .def()
                .rev(),
        )
    }
}

#[async_trait::async_trait]
impl ActiveModelBehavior for ActiveModel {
    /// Called before insert - generate ID and set timestamps
    fn new() -> Self {
        Self {
            id: sea_orm::ActiveValue::Set(Id::new()),
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
