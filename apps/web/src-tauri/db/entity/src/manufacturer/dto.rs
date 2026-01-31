use super::Id;
use super::Model;
use serde::{Deserialize, Serialize};

/// DTO for creating a new manufacturer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateManufacturer {
    pub name: String,
    pub short_name: Option<String>,
    pub country: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub website: Option<String>,
    pub notes: Option<String>,
}

/// DTO for updating an existing manufacturer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateManufacturer {
    pub name: Option<String>,
    pub short_name: Option<String>,
    pub country: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub website: Option<String>,
    pub notes: Option<String>,
    pub is_active: Option<bool>,
}

/// DTO for manufacturer response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ManufacturerResponse {
    pub id: Id,
    pub name: String,
    pub short_name: Option<String>,
    pub country: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub website: Option<String>,
    pub notes: Option<String>,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

impl From<Model> for ManufacturerResponse {
    fn from(model: Model) -> Self {
        Self {
            id: model.id,
            name: model.name,
            short_name: model.short_name,
            country: model.country,
            phone: model.phone,
            email: model.email,
            website: model.website,
            notes: model.notes,
            is_active: model.is_active,
            created_at: model.created_at.to_string(),
            updated_at: model.updated_at.to_string(),
        }
    }
}
