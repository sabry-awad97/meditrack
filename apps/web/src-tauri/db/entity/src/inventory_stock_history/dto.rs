use super::Id;
use super::Model;
use super::StockAdjustmentType;
use serde::{Deserialize, Serialize};

/// Response DTO for stock history entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StockHistoryResponse {
    pub id: Id,
    pub inventory_item_id: Id,
    pub adjustment_type: StockAdjustmentType,
    pub quantity_before: i32,
    pub quantity_after: i32,
    pub adjustment_amount: i32,
    pub reason: Option<String>,
    pub reference_id: Option<Id>,
    pub reference_type: Option<String>,
    pub recorded_at: String, // ISO 8601 timestamp
    pub recorded_by: Option<Id>,
}

impl From<Model> for StockHistoryResponse {
    fn from(model: Model) -> Self {
        Self {
            id: model.id,
            inventory_item_id: model.inventory_item_id,
            adjustment_type: model.adjustment_type,
            quantity_before: model.quantity_before,
            quantity_after: model.quantity_after,
            adjustment_amount: model.adjustment_amount,
            reason: model.reason,
            reference_id: model.reference_id,
            reference_type: model.reference_type,
            recorded_at: model.recorded_at.to_string(),
            recorded_by: model.recorded_by,
        }
    }
}

/// Stock history statistics DTO
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StockHistoryStatistics {
    pub total_adjustments: i64,
    pub total_added: i64,
    pub total_removed: i64,
    pub net_change: i64,
    pub most_common_adjustment_type: Option<StockAdjustmentType>,
}

/// Query filter for stock history
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct StockHistoryQueryDto {
    pub inventory_item_id: Id,
    pub limit: Option<u64>,
}
