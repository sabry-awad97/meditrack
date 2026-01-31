use super::super::id::Id;
use serde::{Deserialize, Serialize};

/// DTO for creating a new barcode
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateInventoryItemBarcode {
    pub inventory_item_id: Id,
    pub barcode: String,
    pub barcode_type: Option<String>,
    pub is_primary: bool,
    pub description: Option<String>,
    pub created_by: Option<Id>,
}

/// DTO for updating a barcode
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateInventoryItemBarcode {
    pub barcode: Option<String>,
    pub barcode_type: Option<String>,
    pub is_primary: Option<bool>,
    pub description: Option<String>,
}

/// Response DTO for barcode
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InventoryItemBarcodeResponse {
    pub id: Id,
    pub inventory_item_id: Id,
    pub barcode: String,
    pub barcode_type: Option<String>,
    pub is_primary: bool,
    pub description: Option<String>,
    pub created_at: String,
    pub created_by: Option<Id>,
}

impl From<super::Model> for InventoryItemBarcodeResponse {
    fn from(model: super::Model) -> Self {
        Self {
            id: model.id,
            inventory_item_id: model.inventory_item_id,
            barcode: model.barcode,
            barcode_type: model.barcode_type,
            is_primary: model.is_primary,
            description: model.description,
            created_at: model.created_at.to_rfc3339(),
            created_by: model.created_by,
        }
    }
}
