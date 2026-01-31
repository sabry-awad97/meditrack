pub mod dto;

use super::id::Id;
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// Manufacturer entity - represents pharmaceutical manufacturers
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "manufacturers")]
pub struct Model {
    /// Primary key - PostgreSQL UUID type
    #[sea_orm(primary_key, auto_increment = false, column_type = "Uuid")]
    pub id: Id,

    /// Manufacturer name - VARCHAR(200) (unique)
    #[sea_orm(column_type = "String(StringLen::N(200))", unique)]
    pub name: String,

    /// Short name/abbreviation - VARCHAR(50) (nullable)
    #[sea_orm(column_type = "String(StringLen::N(50))", nullable)]
    pub short_name: Option<String>,

    /// Country of origin - VARCHAR(100) (nullable)
    #[sea_orm(column_type = "String(StringLen::N(100))", nullable)]
    pub country: Option<String>,

    /// Contact phone - VARCHAR(50) (nullable)
    #[sea_orm(column_type = "String(StringLen::N(50))", nullable)]
    pub phone: Option<String>,

    /// Contact email - VARCHAR(100) (nullable)
    #[sea_orm(column_type = "String(StringLen::N(100))", nullable)]
    pub email: Option<String>,

    /// Website URL - VARCHAR(200) (nullable)
    #[sea_orm(column_type = "String(StringLen::N(200))", nullable)]
    pub website: Option<String>,

    /// Additional notes - TEXT (nullable)
    #[sea_orm(column_type = "Text", nullable)]
    pub notes: Option<String>,

    /// Whether manufacturer is active - BOOLEAN
    pub is_active: bool,

    /// Record creation timestamp - PostgreSQL TIMESTAMPTZ
    #[sea_orm(column_type = "TimestampWithTimeZone")]
    pub created_at: DateTimeWithTimeZone,

    /// Last update timestamp - PostgreSQL TIMESTAMPTZ (auto-updated)
    #[sea_orm(column_type = "TimestampWithTimeZone")]
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// One-to-many: Manufacturer has many inventory items
    #[sea_orm(has_many = "super::inventory_item::Entity")]
    InventoryItems,
}

impl Related<super::inventory_item::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::InventoryItems.def()
    }
}

#[async_trait::async_trait]
impl ActiveModelBehavior for ActiveModel {
    /// Called before insert - generate ID and set timestamps
    fn new() -> Self {
        Self {
            id: sea_orm::ActiveValue::Set(Id::new()),
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
