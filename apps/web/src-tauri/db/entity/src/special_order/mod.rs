pub mod dto;

use super::id::Id;
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// Special order status enum - PostgreSQL native enum type
#[derive(Debug, Clone, Copy, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "special_order_status"
)]
pub enum SpecialOrderStatus {
    #[sea_orm(string_value = "pending")]
    Pending,
    #[sea_orm(string_value = "ordered")]
    Ordered,
    #[sea_orm(string_value = "arrived")]
    Arrived,
    #[sea_orm(string_value = "ready_for_pickup")]
    ReadyForPickup,
    #[sea_orm(string_value = "delivered")]
    Delivered,
    #[sea_orm(string_value = "cancelled")]
    Cancelled,
}

/// Special order entity - represents special medicine orders from customers
/// Optimized for PostgreSQL with native types
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "special_orders")]
pub struct Model {
    /// Primary key - PostgreSQL UUID type
    #[sea_orm(primary_key, auto_increment = false, column_type = "Uuid")]
    pub id: Id,

    /// Customer ID - foreign key to customers table
    #[sea_orm(column_type = "Uuid")]
    pub customer_id: Id,

    /// Supplier ID - foreign key to suppliers table (nullable)
    #[sea_orm(column_type = "Uuid", nullable)]
    pub supplier_id: Option<Id>,

    /// Order number (human-readable) - VARCHAR(50) (unique)
    #[sea_orm(column_type = "String(StringLen::N(50))", unique)]
    pub order_number: String,

    /// Order status - PostgreSQL ENUM type
    pub status: SpecialOrderStatus,

    /// Order date - DATE
    pub order_date: Date,

    /// Expected arrival date - DATE (nullable)
    #[sea_orm(nullable)]
    pub expected_arrival_date: Option<Date>,

    /// Actual arrival date - DATE (nullable)
    #[sea_orm(nullable)]
    pub actual_arrival_date: Option<Date>,

    /// Delivery/pickup date - DATE (nullable)
    #[sea_orm(nullable)]
    pub delivery_date: Option<Date>,

    /// Total amount - DECIMAL(10,2)
    #[sea_orm(column_type = "Decimal(Some((10, 2)))")]
    pub total_amount: Decimal,

    /// Deposit paid - DECIMAL(10,2) (nullable)
    #[sea_orm(column_type = "Decimal(Some((10, 2)))", nullable)]
    pub deposit_paid: Option<Decimal>,

    /// Additional notes - TEXT (nullable)
    #[sea_orm(column_type = "Text", nullable)]
    pub notes: Option<String>,

    /// Internal notes (not visible to customer) - TEXT (nullable)
    #[sea_orm(column_type = "Text", nullable)]
    pub internal_notes: Option<String>,

    // === Audit & Compliance ===
    /// User who created this order - UUID (nullable)
    #[sea_orm(column_type = "Uuid", nullable)]
    pub created_by: Option<Id>,

    /// User who last modified this order - UUID (nullable)
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
    /// Many-to-one: Special order belongs to one customer
    #[sea_orm(
        belongs_to = "super::customer::Entity",
        from = "Column::CustomerId",
        to = "super::customer::Column::Id"
    )]
    Customer,

    /// Many-to-one: Special order may have one supplier
    #[sea_orm(
        belongs_to = "super::supplier::Entity",
        from = "Column::SupplierId",
        to = "super::supplier::Column::Id"
    )]
    Supplier,

    /// One-to-many: Special order has many order items
    #[sea_orm(has_many = "super::special_order_item::Entity")]
    SpecialOrderItems,
}

impl Related<super::customer::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Customer.def()
    }
}

impl Related<super::supplier::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Supplier.def()
    }
}

impl Related<super::special_order_item::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::SpecialOrderItems.def()
    }
}

#[async_trait::async_trait]
impl ActiveModelBehavior for ActiveModel {
    /// Called before insert - generate ID and set timestamps
    fn new() -> Self {
        Self {
            id: sea_orm::ActiveValue::Set(Id::new()),
            order_date: sea_orm::ActiveValue::Set(chrono::Utc::now().date_naive()),
            status: sea_orm::ActiveValue::Set(SpecialOrderStatus::Pending),
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
