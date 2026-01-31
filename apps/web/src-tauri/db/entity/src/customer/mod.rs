pub mod dto;

use super::id::Id;
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// Customer entity - represents pharmacy customers
/// Optimized for PostgreSQL with native types
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "customers")]
pub struct Model {
    /// Primary key - PostgreSQL UUID type
    #[sea_orm(primary_key, auto_increment = false, column_type = "Uuid")]
    pub id: Id,

    /// Customer full name - VARCHAR(200)
    #[sea_orm(column_type = "String(StringLen::N(200))")]
    pub full_name: String,

    /// Primary phone number - VARCHAR(20)
    #[sea_orm(column_type = "String(StringLen::N(20))")]
    pub phone_number: String,

    /// Alternative phone number - VARCHAR(20) (nullable)
    #[sea_orm(column_type = "String(StringLen::N(20))", nullable)]
    pub alt_phone_number: Option<String>,

    /// Email address - VARCHAR(255) (nullable)
    #[sea_orm(column_type = "String(StringLen::N(255))", nullable)]
    pub email: Option<String>,

    /// Physical address - TEXT (nullable)
    #[sea_orm(column_type = "Text", nullable)]
    pub address: Option<String>,

    /// Date of birth - DATE (nullable, for age verification)
    #[sea_orm(nullable)]
    pub date_of_birth: Option<Date>,

    /// National ID or insurance number - VARCHAR(50) (nullable)
    #[sea_orm(column_type = "String(StringLen::N(50))", nullable)]
    pub national_id: Option<String>,

    /// Additional notes about customer - TEXT (nullable)
    #[sea_orm(column_type = "Text", nullable)]
    pub notes: Option<String>,

    /// Whether customer is active - BOOLEAN
    pub is_active: bool,

    // === Audit & Compliance ===
    /// User who created this customer - UUID (nullable)
    #[sea_orm(column_type = "Uuid", nullable)]
    pub created_by: Option<Id>,

    /// User who last modified this customer - UUID (nullable)
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
    /// One-to-many: Customer has many special orders
    #[sea_orm(has_many = "super::special_order::Entity")]
    SpecialOrders,
}

impl Related<super::special_order::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::SpecialOrders.def()
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
