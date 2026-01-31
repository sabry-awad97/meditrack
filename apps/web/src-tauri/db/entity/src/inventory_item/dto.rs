use super::Model;
use serde::{Deserialize, Serialize};

/// DTO for creating a new inventory item
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateInventoryItem {
    pub name: String,
    pub generic_name: Option<String>,
    pub concentration: String,
    pub form: String,
    pub manufacturer: Option<String>,
    pub barcode: Option<String>,
    pub stock_quantity: i32,
    pub min_stock_level: i32,
    pub unit_price: f64,
    pub requires_prescription: bool,
    pub is_controlled: bool,
    pub storage_instructions: Option<String>,
    pub notes: Option<String>,
}

/// DTO for updating an existing inventory item
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateInventoryItem {
    pub name: Option<String>,
    pub generic_name: Option<String>,
    pub concentration: Option<String>,
    pub form: Option<String>,
    pub manufacturer: Option<String>,
    pub barcode: Option<String>,
    pub stock_quantity: Option<i32>,
    pub min_stock_level: Option<i32>,
    pub unit_price: Option<f64>,
    pub requires_prescription: Option<bool>,
    pub is_controlled: Option<bool>,
    pub storage_instructions: Option<String>,
    pub notes: Option<String>,
    pub is_active: Option<bool>,
}

/// DTO for inventory item response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InventoryItemResponse {
    pub id: String,
    pub name: String,
    pub generic_name: Option<String>,
    pub concentration: String,
    pub form: String,
    pub manufacturer: Option<String>,
    pub barcode: Option<String>,
    pub stock_quantity: i32,
    pub min_stock_level: i32,
    pub unit_price: f64,
    pub requires_prescription: bool,
    pub is_controlled: bool,
    pub storage_instructions: Option<String>,
    pub notes: Option<String>,
    pub is_active: bool,
    pub created_by: Option<String>,
    pub updated_by: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl From<Model> for InventoryItemResponse {
    fn from(model: Model) -> Self {
        Self {
            id: model.id.to_string(),
            name: model.name,
            generic_name: model.generic_name,
            concentration: model.concentration,
            form: model.form,
            manufacturer: model.manufacturer,
            barcode: model.barcode,
            stock_quantity: model.stock_quantity,
            min_stock_level: model.min_stock_level,
            unit_price: model.unit_price.to_string().parse().unwrap_or(0.0),
            requires_prescription: model.requires_prescription,
            is_controlled: model.is_controlled,
            storage_instructions: model.storage_instructions,
            notes: model.notes,
            is_active: model.is_active,
            created_by: model.created_by.map(|id| id.to_string()),
            updated_by: model.updated_by.map(|id| id.to_string()),
            created_at: model.created_at.to_string(),
            updated_at: model.updated_at.to_string(),
        }
    }
}
