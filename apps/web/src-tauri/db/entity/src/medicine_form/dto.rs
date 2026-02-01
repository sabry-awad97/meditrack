use super::super::id::Id;
use super::Model;
use serde::{Deserialize, Serialize};

/// DTO for medicine form query filters
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct MedicineFormQueryDto {
    pub id: Option<Id>,
    pub code: Option<String>,
    pub is_active: Option<bool>,
}

/// DTO for creating a new medicine form
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateMedicineForm {
    pub code: String,
    pub name_en: String,
    pub name_ar: String,
    pub display_order: i32,
}

/// DTO for updating an existing medicine form
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateMedicineForm {
    pub code: Option<String>,
    pub name_en: Option<String>,
    pub name_ar: Option<String>,
    pub display_order: Option<i32>,
    pub is_active: Option<bool>,
}

/// DTO for medicine form response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MedicineFormResponse {
    pub id: Id,
    pub code: String,
    pub name_en: String,
    pub name_ar: String,
    pub display_order: i32,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

impl From<Model> for MedicineFormResponse {
    fn from(model: Model) -> Self {
        Self {
            id: model.id,
            code: model.code,
            name_en: model.name_en,
            name_ar: model.name_ar,
            display_order: model.display_order,
            is_active: model.is_active,
            created_at: model.created_at.to_string(),
            updated_at: model.updated_at.to_string(),
        }
    }
}
