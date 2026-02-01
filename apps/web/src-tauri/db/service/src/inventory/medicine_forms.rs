use db_entity::id::Id;
use db_entity::medicine_form::dto::*;
use db_entity::prelude::*;
use sea_orm::*;
use std::sync::Arc;
use tap::TapFallible;

use crate::error::{ServiceError, ServiceResult};
use crate::pagination::{PaginationParams, PaginationResult};

/// Medicine forms service for managing pharmaceutical dosage forms
pub struct MedicineFormsService {
    db: Arc<DatabaseConnection>,
}

impl MedicineFormsService {
    /// Create a new medicine forms service
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }

    // ========================================================================
    // CRUD Operations
    // ========================================================================

    /// Create a new medicine form
    pub async fn create(&self, data: CreateMedicineForm) -> ServiceResult<MedicineFormResponse> {
        // Check if code already exists
        if self.exists_by_code(&data.code).await? {
            return Err(ServiceError::Conflict(format!(
                "Medicine form with code '{}' already exists",
                data.code
            )));
        }

        let medicine_form = db_entity::medicine_form::ActiveModel {
            id: Set(Id::new()),
            code: Set(data.code.clone()),
            name_en: Set(data.name_en),
            name_ar: Set(data.name_ar),
            display_order: Set(data.display_order),
            is_active: Set(true),
            created_at: Set(chrono::Utc::now().into()),
            updated_at: Set(chrono::Utc::now().into()),
        };

        let result = medicine_form
            .insert(self.db.as_ref())
            .await
            .tap_ok(|m| {
                tracing::info!(
                    "Created medicine form: {} ({}) - ID: {}",
                    m.code,
                    m.name_en,
                    m.id
                )
            })
            .tap_err(|e| tracing::error!("Failed to create medicine form: {}", e))?;

        Ok(result.into())
    }

    /// Get a medicine form by ID
    pub async fn get_by_id(&self, id: Id) -> ServiceResult<MedicineFormResponse> {
        let medicine_form = MedicineForm::find_by_id(id)
            .one(self.db.as_ref())
            .await?
            .ok_or_else(|| ServiceError::NotFound(format!("Medicine form not found: {}", id)))?;

        Ok(medicine_form.into())
    }

    /// Get a medicine form by code
    pub async fn get_by_code(&self, code: &str) -> ServiceResult<MedicineFormResponse> {
        let medicine_form = MedicineForm::find()
            .filter(db_entity::medicine_form::Column::Code.eq(code))
            .one(self.db.as_ref())
            .await?
            .ok_or_else(|| ServiceError::NotFound(format!("Medicine form not found: {}", code)))?;

        Ok(medicine_form.into())
    }

    /// List all medicine forms with filtering and pagination
    pub async fn list(
        &self,
        query: MedicineFormQueryDto,
        pagination: Option<PaginationParams>,
    ) -> ServiceResult<PaginationResult<MedicineFormResponse>> {
        let mut select = MedicineForm::find();

        // Apply filters
        if let Some(id) = query.id {
            select = select.filter(db_entity::medicine_form::Column::Id.eq(id));
        }
        if let Some(code) = query.code {
            select = select.filter(db_entity::medicine_form::Column::Code.contains(&code));
        }
        if let Some(is_active) = query.is_active {
            select = select.filter(db_entity::medicine_form::Column::IsActive.eq(is_active));
        }

        // Get total count
        let total = select.clone().count(self.db.as_ref()).await?;

        // Handle pagination
        let (response_items, page, page_size) = if let Some(pagination) = pagination {
            let page = pagination.page();
            let page_size = pagination.page_size();

            let paginator = select
                .order_by_asc(db_entity::medicine_form::Column::DisplayOrder)
                .paginate(self.db.as_ref(), page_size);
            let items = paginator.fetch_page(page - 1).await?;
            let response_items = items.into_iter().map(|m| m.into()).collect();
            (response_items, page, page_size)
        } else {
            // No pagination - return all results ordered by display_order
            let items = select
                .order_by_asc(db_entity::medicine_form::Column::DisplayOrder)
                .all(self.db.as_ref())
                .await?;
            let response_items = items.into_iter().map(|m| m.into()).collect();
            (response_items, 1u64, total)
        };

        Ok(PaginationResult::new(
            response_items,
            total,
            page,
            page_size,
        ))
    }

    /// Get all active medicine forms (for dropdowns)
    pub async fn list_active(&self) -> ServiceResult<Vec<MedicineFormResponse>> {
        let forms = MedicineForm::find()
            .filter(db_entity::medicine_form::Column::IsActive.eq(true))
            .order_by_asc(db_entity::medicine_form::Column::DisplayOrder)
            .all(self.db.as_ref())
            .await
            .tap_err(|e| tracing::error!("Failed to list active medicine forms: {}", e))?;

        Ok(forms.into_iter().map(|f| f.into()).collect())
    }

    /// Update a medicine form
    pub async fn update(
        &self,
        id: Id,
        data: UpdateMedicineForm,
    ) -> ServiceResult<MedicineFormResponse> {
        let medicine_form = MedicineForm::find_by_id(id)
            .one(self.db.as_ref())
            .await?
            .ok_or_else(|| ServiceError::NotFound(format!("Medicine form not found: {}", id)))?;

        let mut active_model: db_entity::medicine_form::ActiveModel = medicine_form.into();

        if let Some(code) = data.code {
            // Check if new code conflicts with existing form
            if self.exists_by_code(&code).await? {
                return Err(ServiceError::Conflict(format!(
                    "Medicine form with code '{}' already exists",
                    code
                )));
            }
            active_model.code = Set(code);
        }
        if let Some(name_en) = data.name_en {
            active_model.name_en = Set(name_en);
        }
        if let Some(name_ar) = data.name_ar {
            active_model.name_ar = Set(name_ar);
        }
        if let Some(display_order) = data.display_order {
            active_model.display_order = Set(display_order);
        }
        if let Some(is_active) = data.is_active {
            active_model.is_active = Set(is_active);
        }

        let result = active_model
            .update(self.db.as_ref())
            .await
            .tap_ok(|m| {
                tracing::info!(
                    "Updated medicine form: {} ({}) - ID: {}",
                    m.code,
                    m.name_en,
                    m.id
                )
            })
            .tap_err(|e| tracing::error!("Failed to update medicine form {}: {}", id, e))?;

        Ok(result.into())
    }

    /// Delete a medicine form (soft delete by setting is_active to false)
    pub async fn delete(&self, id: Id) -> ServiceResult<()> {
        // Check if any inventory items are using this form
        let usage_count = InventoryItem::find()
            .filter(db_entity::inventory_item::Column::MedicineFormId.eq(id))
            .count(self.db.as_ref())
            .await?;

        if usage_count > 0 {
            return Err(ServiceError::Conflict(format!(
                "Cannot delete medicine form: {} inventory items are using it",
                usage_count
            )));
        }

        let medicine_form = MedicineForm::find_by_id(id)
            .one(self.db.as_ref())
            .await?
            .ok_or_else(|| ServiceError::NotFound(format!("Medicine form not found: {}", id)))?;

        let mut active_model: db_entity::medicine_form::ActiveModel = medicine_form.into();
        active_model.is_active = Set(false);

        active_model
            .update(self.db.as_ref())
            .await
            .tap_ok(|m| {
                tracing::info!(
                    "Soft deleted medicine form: {} ({}) - ID: {}",
                    m.code,
                    m.name_en,
                    m.id
                )
            })
            .tap_err(|e| tracing::error!("Failed to delete medicine form {}: {}", id, e))?;

        Ok(())
    }

    /// Restore a soft-deleted medicine form
    pub async fn restore(&self, id: Id) -> ServiceResult<MedicineFormResponse> {
        let medicine_form = MedicineForm::find_by_id(id)
            .one(self.db.as_ref())
            .await?
            .ok_or_else(|| ServiceError::NotFound(format!("Medicine form not found: {}", id)))?;

        let mut active_model: db_entity::medicine_form::ActiveModel = medicine_form.into();
        active_model.is_active = Set(true);

        let result = active_model
            .update(self.db.as_ref())
            .await
            .tap_ok(|m| {
                tracing::info!(
                    "Restored medicine form: {} ({}) - ID: {}",
                    m.code,
                    m.name_en,
                    m.id
                )
            })
            .tap_err(|e| tracing::error!("Failed to restore medicine form {}: {}", id, e))?;

        Ok(result.into())
    }

    // ========================================================================
    // ========================================================================
    // Helper Methods
    // ========================================================================

    /// Check if a medicine form exists by ID
    pub async fn exists(&self, id: Id) -> ServiceResult<bool> {
        let count = MedicineForm::find_by_id(id).count(self.db.as_ref()).await?;
        Ok(count > 0)
    }

    /// Check if a medicine form exists by code
    pub async fn exists_by_code(&self, code: &str) -> ServiceResult<bool> {
        let count = MedicineForm::find()
            .filter(db_entity::medicine_form::Column::Code.eq(code))
            .count(self.db.as_ref())
            .await?;
        Ok(count > 0)
    }

    /// Get medicine form usage statistics
    pub async fn get_usage_count(&self, id: Id) -> ServiceResult<u64> {
        let count = InventoryItem::find()
            .filter(db_entity::inventory_item::Column::MedicineFormId.eq(id))
            .count(self.db.as_ref())
            .await?;
        Ok(count)
    }

    /// Reorder medicine forms (update display_order for multiple forms)
    pub async fn reorder(&self, orders: Vec<(Id, i32)>) -> ServiceResult<()> {
        let txn = self.db.begin().await?;
        let count = orders.len();

        for (id, new_order) in orders {
            let medicine_form = MedicineForm::find_by_id(id)
                .one(&txn)
                .await?
                .ok_or_else(|| {
                    ServiceError::NotFound(format!("Medicine form not found: {}", id))
                })?;

            let mut active_model: db_entity::medicine_form::ActiveModel = medicine_form.into();
            active_model.display_order = Set(new_order);

            active_model.update(&txn).await?;
        }

        txn.commit()
            .await
            .tap_ok(|_| tracing::info!("Reordered {} medicine forms", count))
            .tap_err(|e| tracing::error!("Failed to reorder medicine forms: {}", e))?;

        Ok(())
    }
}
