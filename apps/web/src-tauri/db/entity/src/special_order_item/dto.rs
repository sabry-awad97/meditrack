use super::Model;
use serde::{Deserialize, Serialize};

/// DTO for creating a new special order item
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateSpecialOrderItem {
    pub special_order_id: String,
    pub inventory_item_id: Option<String>,
    pub custom_item_name: Option<String>,
    pub custom_concentration: Option<String>,
    pub custom_form: Option<String>,
    pub quantity: i32,
    pub unit_price: f64,
    pub notes: Option<String>,
}

/// DTO for updating an existing special order item
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateSpecialOrderItem {
    pub inventory_item_id: Option<String>,
    pub custom_item_name: Option<String>,
    pub custom_concentration: Option<String>,
    pub custom_form: Option<String>,
    pub quantity: Option<i32>,
    pub unit_price: Option<f64>,
    pub notes: Option<String>,
}

/// DTO for special order item response with calculated subtotal
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpecialOrderItemResponse {
    pub id: String,
    pub special_order_id: String,
    pub inventory_item_id: Option<String>,
    pub custom_item_name: Option<String>,
    pub custom_concentration: Option<String>,
    pub custom_form: Option<String>,
    pub quantity: i32,
    pub unit_price: f64,
    pub subtotal: f64, // Calculated field (quantity * unit_price)
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl From<Model> for SpecialOrderItemResponse {
    fn from(model: Model) -> Self {
        let unit_price: f64 = model.unit_price.to_string().parse().unwrap_or(0.0);
        let subtotal = model.quantity as f64 * unit_price;

        Self {
            id: model.id.to_string(),
            special_order_id: model.special_order_id.to_string(),
            inventory_item_id: model.inventory_item_id.map(|id| id.to_string()),
            custom_item_name: model.custom_item_name,
            custom_concentration: model.custom_concentration,
            custom_form: model.custom_form,
            quantity: model.quantity,
            unit_price,
            subtotal, // Calculated on-the-fly
            notes: model.notes,
            created_at: model.created_at.to_string(),
            updated_at: model.updated_at.to_string(),
        }
    }
}
