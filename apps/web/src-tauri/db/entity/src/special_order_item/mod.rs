pub mod dto;

use super::id::Id;
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// Special order item entity - junction table linking orders to inventory items
/// Optimized for PostgreSQL with native types
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "special_order_items")]
pub struct Model {
    /// Primary key - PostgreSQL UUID type
    #[sea_orm(primary_key, auto_increment = false, column_type = "Uuid")]
    pub id: Id,

    /// Special order ID - foreign key to special_orders table
    #[sea_orm(column_type = "Uuid")]
    pub special_order_id: Id,

    /// Inventory item ID - foreign key to inventory_items table (nullable for custom items)
    #[sea_orm(column_type = "Uuid", nullable)]
    pub inventory_item_id: Option<Id>,

    /// Custom item name (if not in inventory) - VARCHAR(200) (nullable)
    #[sea_orm(column_type = "String(StringLen::N(200))", nullable)]
    pub custom_item_name: Option<String>,

    /// Custom concentration (if not in inventory) - VARCHAR(50) (nullable)
    #[sea_orm(column_type = "String(StringLen::N(50))", nullable)]
    pub custom_concentration: Option<String>,

    /// Custom form (if not in inventory) - VARCHAR(50) (nullable)
    #[sea_orm(column_type = "String(StringLen::N(50))", nullable)]
    pub custom_form: Option<String>,

    /// Quantity ordered - INTEGER
    #[sea_orm(column_type = "Integer")]
    pub quantity: i32,

    /// Unit price at time of order - DECIMAL(10,2)
    #[sea_orm(column_type = "Decimal(Some((10, 2)))")]
    pub unit_price: Decimal,

    /// Item-specific notes - TEXT (nullable)
    #[sea_orm(column_type = "Text", nullable)]
    pub notes: Option<String>,

    // === Audit & Compliance ===
    /// Record creation timestamp - PostgreSQL TIMESTAMPTZ
    #[sea_orm(column_type = "TimestampWithTimeZone")]
    pub created_at: DateTimeWithTimeZone,

    /// Last update timestamp - PostgreSQL TIMESTAMPTZ (auto-updated)
    #[sea_orm(column_type = "TimestampWithTimeZone")]
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// Many-to-one: Order item belongs to one special order
    #[sea_orm(
        belongs_to = "super::special_order::Entity",
        from = "Column::SpecialOrderId",
        to = "super::special_order::Column::Id"
    )]
    SpecialOrder,

    /// Many-to-one: Order item may reference one inventory item
    #[sea_orm(
        belongs_to = "super::inventory_item::Entity",
        from = "Column::InventoryItemId",
        to = "super::inventory_item::Column::Id"
    )]
    InventoryItem,
}

impl Related<super::special_order::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::SpecialOrder.def()
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
            created_at: sea_orm::ActiveValue::Set(chrono::Utc::now().into()),
            updated_at: sea_orm::ActiveValue::Set(chrono::Utc::now().into()),
            ..Default::default()
        }
    }

    /// Called before save - update timestamp
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
