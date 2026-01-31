use super::Model;
use serde::{Deserialize, Serialize};

/// DTO for creating a new customer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateCustomer {
    pub full_name: String,
    pub phone_number: String,
    pub alt_phone_number: Option<String>,
    pub email: Option<String>,
    pub address: Option<String>,
    pub date_of_birth: Option<String>, // ISO date string
    pub national_id: Option<String>,
    pub notes: Option<String>,
}

/// DTO for updating an existing customer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateCustomer {
    pub full_name: Option<String>,
    pub phone_number: Option<String>,
    pub alt_phone_number: Option<String>,
    pub email: Option<String>,
    pub address: Option<String>,
    pub date_of_birth: Option<String>, // ISO date string
    pub national_id: Option<String>,
    pub notes: Option<String>,
    pub is_active: Option<bool>,
}

/// DTO for customer response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomerResponse {
    pub id: String,
    pub full_name: String,
    pub phone_number: String,
    pub alt_phone_number: Option<String>,
    pub email: Option<String>,
    pub address: Option<String>,
    pub date_of_birth: Option<String>,
    pub national_id: Option<String>,
    pub notes: Option<String>,
    pub is_active: bool,
    pub created_by: Option<String>,
    pub updated_by: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl From<Model> for CustomerResponse {
    fn from(model: Model) -> Self {
        Self {
            id: model.id.to_string(),
            full_name: model.full_name,
            phone_number: model.phone_number,
            alt_phone_number: model.alt_phone_number,
            email: model.email,
            address: model.address,
            date_of_birth: model.date_of_birth.map(|d| d.to_string()),
            national_id: model.national_id,
            notes: model.notes,
            is_active: model.is_active,
            created_by: model.created_by.map(|id| id.to_string()),
            updated_by: model.updated_by.map(|id| id.to_string()),
            created_at: model.created_at.to_string(),
            updated_at: model.updated_at.to_string(),
        }
    }
}
