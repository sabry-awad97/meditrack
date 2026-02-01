use std::sync::Arc;

use db_entity::id::Id;
use db_entity::inventory_stock_history::dto::{StockHistoryResponse, StockHistoryStatistics};
use db_entity::inventory_stock_history::{self, Entity as StockHistory};
use sea_orm::*;
use tap::TapFallible;

use crate::error::ServiceResult;

/// Stock history service for managing historical stock adjustment data
pub struct StockHistoryService {
    db: Arc<DatabaseConnection>,
}

impl StockHistoryService {
    /// Create a new stock history service
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }

    /// Get stock history for an inventory item
    ///
    /// # Arguments
    /// * `inventory_item_id` - The ID of the inventory item
    /// * `limit` - Optional limit on number of entries to return
    ///
    /// # Returns
    /// Vector of stock history entries ordered by recorded_at descending
    pub async fn get_stock_history(
        &self,
        inventory_item_id: Id,
        limit: Option<u64>,
    ) -> ServiceResult<Vec<StockHistoryResponse>> {
        let mut query = StockHistory::find()
            .filter(inventory_stock_history::Column::InventoryItemId.eq(inventory_item_id))
            .order_by_desc(inventory_stock_history::Column::RecordedAt);

        if let Some(limit) = limit {
            query = query.limit(limit);
        }

        let entries = query.all(&*self.db).await.tap_err(|e| {
            tracing::error!(
                "Failed to get stock history for item {}: {}",
                inventory_item_id,
                e
            )
        })?;

        Ok(entries
            .into_iter()
            .map(StockHistoryResponse::from)
            .collect())
    }

    /// Get the latest stock adjustment entry for an inventory item
    ///
    /// # Arguments
    /// * `inventory_item_id` - The ID of the inventory item
    ///
    /// # Returns
    /// The most recent stock history entry, or None if no history exists
    pub async fn get_latest_adjustment(
        &self,
        inventory_item_id: Id,
    ) -> ServiceResult<Option<StockHistoryResponse>> {
        let entry = StockHistory::find()
            .filter(inventory_stock_history::Column::InventoryItemId.eq(inventory_item_id))
            .order_by_desc(inventory_stock_history::Column::RecordedAt)
            .one(&*self.db)
            .await
            .tap_err(|e| {
                tracing::error!(
                    "Failed to get latest stock adjustment for item {}: {}",
                    inventory_item_id,
                    e
                )
            })?;

        Ok(entry.map(StockHistoryResponse::from))
    }

    /// Get stock history statistics for an inventory item
    ///
    /// # Arguments
    /// * `inventory_item_id` - The ID of the inventory item
    ///
    /// # Returns
    /// Stock history statistics including total adjustments, additions, removals, and net change
    pub async fn get_stock_history_statistics(
        &self,
        inventory_item_id: Id,
    ) -> ServiceResult<StockHistoryStatistics> {
        let entries = StockHistory::find()
            .filter(inventory_stock_history::Column::InventoryItemId.eq(inventory_item_id))
            .all(&*self.db)
            .await
            .tap_err(|e| {
                tracing::error!(
                    "Failed to get stock history statistics for item {}: {}",
                    inventory_item_id,
                    e
                )
            })?;

        if entries.is_empty() {
            // Return zero statistics if no history
            return Ok(StockHistoryStatistics {
                total_adjustments: 0,
                total_added: 0,
                total_removed: 0,
                net_change: 0,
                most_common_adjustment_type: None,
            });
        }

        let total_adjustments = entries.len() as i64;
        let total_added: i64 = entries
            .iter()
            .filter(|e| e.adjustment_amount > 0)
            .map(|e| e.adjustment_amount as i64)
            .sum();
        let total_removed: i64 = entries
            .iter()
            .filter(|e| e.adjustment_amount < 0)
            .map(|e| e.adjustment_amount.abs() as i64)
            .sum();
        let net_change: i64 = entries.iter().map(|e| e.adjustment_amount as i64).sum();

        // Find most common adjustment type
        let mut type_counts = std::collections::HashMap::new();
        for entry in &entries {
            *type_counts.entry(&entry.adjustment_type).or_insert(0) += 1;
        }
        let most_common_adjustment_type = type_counts
            .into_iter()
            .max_by_key(|(_, count)| *count)
            .map(|(adj_type, _)| adj_type.clone());

        Ok(StockHistoryStatistics {
            total_adjustments,
            total_added,
            total_removed,
            net_change,
            most_common_adjustment_type,
        })
    }
}
