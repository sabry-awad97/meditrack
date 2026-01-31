use super::Model;
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

/// DTO for creating/updating a setting
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpsertSetting {
    pub key: String,
    pub value: JsonValue,
    pub category: Option<String>,
    pub description: Option<String>,
}

/// DTO for setting response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SettingResponse {
    pub key: String,
    pub value: JsonValue,
    pub category: Option<String>,
    pub description: Option<String>,
    pub updated_by: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl From<Model> for SettingResponse {
    fn from(model: Model) -> Self {
        Self {
            key: model.key,
            value: model.value,
            category: model.category,
            description: model.description,
            updated_by: model.updated_by.map(|id| id.to_string()),
            created_at: model.created_at.to_string(),
            updated_at: model.updated_at.to_string(),
        }
    }
}
