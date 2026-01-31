use super::Model;
use serde::{Deserialize, Serialize};

/// DTO for creating a new supplier-inventory item relationship
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateSupplierInventoryItem {
    pub supplier_id: String,
    pub inventory_item_id: String,
    pub supplier_price: f64,
    pub delivery_days: i32,
    pub min_order_quantity: Option<i32>,
    pub is_preferred: bool,
    pub notes: Option<String>,
}

/// DTO for updating an existing supplier-inventory item relationship
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateSupplierInventoryItem {
    pub supplier_price: Option<f64>,
    pub delivery_days: Option<i32>,
    pub min_order_quantity: Option<i32>,
    pub is_preferred: Option<bool>,
    pub is_active: Option<bool>,
    pub last_order_date: Option<String>, // ISO date string
    pub notes: Option<String>,
}

/// DTO for supplier-inventory item response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SupplierInventoryItemResponse {
    pub id: String,
    pub supplier_id: String,
    pub inventory_item_id: String,
    pub supplier_price: f64,
    pub delivery_days: i32,
    pub min_order_quantity: Option<i32>,
    pub is_preferred: bool,
    pub is_active: bool,
    pub last_order_date: Option<String>,
    pub notes: Option<String>,
    pub created_by: Option<String>,
    pub updated_by: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl From<Model> for SupplierInventoryItemResponse {
    fn from(model: Model) -> Self {
        Self {
            id: model.id.to_string(),
            supplier_id: model.supplier_id.to_string(),
            inventory_item_id: model.inventory_item_id.to_string(),
            supplier_price: model.supplier_price.to_string().parse().unwrap_or(0.0),
            delivery_days: model.delivery_days,
            min_order_quantity: model.min_order_quantity,
            is_preferred: model.is_preferred,
            is_active: model.is_active,
            last_order_date: model.last_order_date.map(|d| d.to_string()),
            notes: model.notes,
            created_by: model.created_by.map(|id| id.to_string()),
            updated_by: model.updated_by.map(|id| id.to_string()),
            created_at: model.created_at.to_string(),
            updated_at: model.updated_at.to_string(),
        }
    }
}
