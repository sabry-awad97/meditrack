use super::{Model, SpecialOrderStatus};
use serde::{Deserialize, Serialize};

/// DTO for creating a new special order
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateSpecialOrder {
    pub customer_id: String,
    pub supplier_id: Option<String>,
    pub order_number: String,
    pub expected_arrival_date: Option<String>, // ISO date string
    pub total_amount: f64,
    pub deposit_paid: Option<f64>,
    pub notes: Option<String>,
    pub internal_notes: Option<String>,
}

/// DTO for updating an existing special order
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateSpecialOrder {
    pub customer_id: Option<String>,
    pub supplier_id: Option<String>,
    pub status: Option<SpecialOrderStatus>,
    pub expected_arrival_date: Option<String>,
    pub actual_arrival_date: Option<String>,
    pub delivery_date: Option<String>,
    pub total_amount: Option<f64>,
    pub deposit_paid: Option<f64>,
    pub notes: Option<String>,
    pub internal_notes: Option<String>,
}

/// DTO for special order response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpecialOrderResponse {
    pub id: String,
    pub customer_id: String,
    pub supplier_id: Option<String>,
    pub order_number: String,
    pub status: SpecialOrderStatus,
    pub order_date: String,
    pub expected_arrival_date: Option<String>,
    pub actual_arrival_date: Option<String>,
    pub delivery_date: Option<String>,
    pub total_amount: f64,
    pub deposit_paid: Option<f64>,
    pub notes: Option<String>,
    pub internal_notes: Option<String>,
    pub created_by: Option<String>,
    pub updated_by: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl From<Model> for SpecialOrderResponse {
    fn from(model: Model) -> Self {
        Self {
            id: model.id.to_string(),
            customer_id: model.customer_id.to_string(),
            supplier_id: model.supplier_id.map(|id| id.to_string()),
            order_number: model.order_number,
            status: model.status,
            order_date: model.order_date.to_string(),
            expected_arrival_date: model.expected_arrival_date.map(|d| d.to_string()),
            actual_arrival_date: model.actual_arrival_date.map(|d| d.to_string()),
            delivery_date: model.delivery_date.map(|d| d.to_string()),
            total_amount: model.total_amount.to_string().parse().unwrap_or(0.0),
            deposit_paid: model
                .deposit_paid
                .map(|d| d.to_string().parse().unwrap_or(0.0)),
            notes: model.notes,
            internal_notes: model.internal_notes,
            created_by: model.created_by.map(|id| id.to_string()),
            updated_by: model.updated_by.map(|id| id.to_string()),
            created_at: model.created_at.to_string(),
            updated_at: model.updated_at.to_string(),
        }
    }
}
