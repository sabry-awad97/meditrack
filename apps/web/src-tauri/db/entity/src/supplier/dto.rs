use super::{Id, Model};
use serde::{Deserialize, Serialize};

/// DTO for creating a new supplier
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateSupplier {
    pub name: String,
    pub phone: String,
    pub whatsapp: Option<String>,
    pub email: Option<String>,
    pub address: Option<String>,
    pub rating: Option<f32>,
    pub notes: Option<String>,
}

/// DTO for updating an existing supplier
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateSupplier {
    pub name: Option<String>,
    pub phone: Option<String>,
    pub whatsapp: Option<String>,
    pub email: Option<String>,
    pub address: Option<String>,
    pub rating: Option<f32>,
    pub notes: Option<String>,
}

/// DTO for supplier response with calculated fields
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SupplierResponse {
    pub id: Id,
    pub name: String,
    pub phone: String,
    pub whatsapp: Option<String>,
    pub email: Option<String>,
    pub address: Option<String>,
    pub rating: f32,
    pub notes: Option<String>,
    pub is_active: bool,
    pub created_by: Option<String>,
    pub updated_by: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    // Calculated fields (not stored in DB)
    pub total_orders: Option<i32>,
    pub avg_delivery_days: Option<i32>,
    pub common_medicines: Option<Vec<String>>,
}

impl From<Model> for SupplierResponse {
    fn from(model: Model) -> Self {
        Self {
            id: model.id,
            name: model.name,
            phone: model.phone,
            whatsapp: model.whatsapp,
            email: model.email,
            address: model.address,
            rating: model.rating.to_string().parse().unwrap_or(3.0),
            notes: model.notes,
            is_active: model.is_active,
            created_by: model.created_by.map(|id| id.to_string()),
            updated_by: model.updated_by.map(|id| id.to_string()),
            created_at: model.created_at.to_string(),
            updated_at: model.updated_at.to_string(),
            // These should be calculated by the service layer
            total_orders: None,
            avg_delivery_days: None,
            common_medicines: None,
        }
    }
}
