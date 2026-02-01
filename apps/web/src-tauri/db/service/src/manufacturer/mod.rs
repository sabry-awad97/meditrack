use std::sync::Arc;

use db_entity::manufacturer::dto::*;
use db_entity::prelude::*;
use sea_orm::*;
use tap::TapFallible;

use crate::error::{ServiceError, ServiceResult};

/// Manufacturer service for managing pharmaceutical manufacturers
pub struct ManufacturerService {
    db: Arc<DatabaseConnection>,
}

impl ManufacturerService {
    /// Create a new manufacturer service
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }

    /// Create a new manufacturer
    pub async fn create(&self, data: CreateManufacturer) -> ServiceResult<ManufacturerResponse> {
        // Check if manufacturer name already exists
        if self.exists_by_name(&data.name).await? {
            return Err(ServiceError::Conflict(format!(
                "Manufacturer '{}' already exists",
                data.name
            )));
        }

        let manufacturer = db_entity::manufacturer::ActiveModel {
            id: Set(Id::new()),
            name: Set(data.name.clone()),
            short_name: Set(data.short_name),
            country: Set(data.country),
            phone: Set(data.phone),
            email: Set(data.email),
            website: Set(data.website),
            notes: Set(data.notes),
            is_active: Set(true),
            created_at: Set(chrono::Utc::now().into()),
            updated_at: Set(chrono::Utc::now().into()),
        };

        let result = manufacturer
            .insert(self.db.as_ref())
            .await
            .tap_ok(|m| tracing::info!("Created manufacturer: {} ({})", m.name, m.id))
            .tap_err(|e| tracing::error!("Failed to create manufacturer: {}", e))?;

        Ok(result.into())
    }

    /// Create multiple manufacturers in bulk (optimized for seeding/imports)
    /// Skips duplicate checks for performance - relies on database constraints
    pub async fn create_bulk(
        &self,
        data: Vec<CreateManufacturer>,
    ) -> ServiceResult<Vec<ManufacturerResponse>> {
        if data.is_empty() {
            return Ok(Vec::new());
        }

        let count = data.len();
        tracing::info!("Bulk creating {} manufacturers", count);

        // Prepare all active models
        let active_models: Vec<db_entity::manufacturer::ActiveModel> = data
            .into_iter()
            .map(|d| db_entity::manufacturer::ActiveModel {
                id: Set(Id::new()),
                name: Set(d.name),
                short_name: Set(d.short_name),
                country: Set(d.country),
                phone: Set(d.phone),
                email: Set(d.email),
                website: Set(d.website),
                notes: Set(d.notes),
                is_active: Set(true),
                created_at: Set(chrono::Utc::now().into()),
                updated_at: Set(chrono::Utc::now().into()),
            })
            .collect();

        // Use insert_many for batch insert
        Manufacturer::insert_many(active_models)
            .exec(self.db.as_ref())
            .await
            .tap_err(|e| tracing::error!("Failed to bulk create manufacturers: {}", e))?;

        tracing::info!("Successfully bulk created {} manufacturers", count);

        // Fetch the inserted records (ordered by creation time, most recent first)
        let results = Manufacturer::find()
            .order_by_desc(db_entity::manufacturer::Column::CreatedAt)
            .limit(count as u64)
            .all(self.db.as_ref())
            .await?;

        Ok(results.into_iter().map(|m| m.into()).collect())
    }

    /// Get a manufacturer by ID
    pub async fn get_by_id(&self, id: Id) -> ServiceResult<ManufacturerResponse> {
        let manufacturer = Manufacturer::find_by_id(id)
            .one(self.db.as_ref())
            .await?
            .ok_or_else(|| ServiceError::NotFound(format!("Manufacturer not found: {}", id)))?;

        Ok(manufacturer.into())
    }

    /// Get a manufacturer by name
    pub async fn get_by_name(&self, name: &str) -> ServiceResult<ManufacturerResponse> {
        let manufacturer = Manufacturer::find()
            .filter(db_entity::manufacturer::Column::Name.eq(name))
            .one(self.db.as_ref())
            .await?
            .ok_or_else(|| ServiceError::NotFound(format!("Manufacturer not found: {}", name)))?;

        Ok(manufacturer.into())
    }

    /// List manufacturers with filtering and pagination
    pub async fn list(
        &self,
        query: ManufacturerQueryDto,
        pagination: Option<crate::pagination::PaginationParams>,
    ) -> ServiceResult<crate::pagination::PaginationResult<ManufacturerResponse>> {
        let mut select = Manufacturer::find();

        // Apply filters
        if let Some(id) = query.id {
            select = select.filter(db_entity::manufacturer::Column::Id.eq(id));
        }
        if let Some(name) = query.name {
            select = select.filter(db_entity::manufacturer::Column::Name.contains(&name));
        }
        if let Some(country) = query.country {
            select = select.filter(db_entity::manufacturer::Column::Country.eq(country));
        }
        if let Some(is_active) = query.is_active {
            select = select.filter(db_entity::manufacturer::Column::IsActive.eq(is_active));
        }

        // Handle soft-deleted records (manufacturers don't have deleted_at, they use is_active)
        // If include_deleted is false (default), only show active manufacturers
        if !query.include_deleted.unwrap_or(false) {
            select = select.filter(db_entity::manufacturer::Column::IsActive.eq(true));
        }

        // Get total count
        let total = select.clone().count(self.db.as_ref()).await?;

        // Handle pagination
        let (response_items, page, page_size) = if let Some(pagination) = pagination {
            // Extract values before consuming
            let page = pagination.page();
            let page_size = pagination.page_size();

            // Apply pagination
            let paginator = select
                .order_by_asc(db_entity::manufacturer::Column::Name)
                .paginate(self.db.as_ref(), page_size);
            let items = paginator.fetch_page(page - 1).await?;
            let response_items = items.into_iter().map(|m| m.into()).collect();
            (response_items, page, page_size)
        } else {
            // No pagination - return all results
            let items = select
                .order_by_asc(db_entity::manufacturer::Column::Name)
                .all(self.db.as_ref())
                .await?;
            let response_items = items.into_iter().map(|m| m.into()).collect();
            (response_items, 1u64, total)
        };

        Ok(crate::pagination::PaginationResult::new(
            response_items,
            total,
            page,
            page_size,
        ))
    }

    /// Update a manufacturer
    pub async fn update(
        &self,
        id: Id,
        data: UpdateManufacturer,
    ) -> ServiceResult<ManufacturerResponse> {
        let manufacturer = Manufacturer::find_by_id(id)
            .one(self.db.as_ref())
            .await?
            .ok_or_else(|| ServiceError::NotFound(format!("Manufacturer not found: {}", id)))?;

        let mut active_model: db_entity::manufacturer::ActiveModel = manufacturer.into();

        if let Some(name) = data.name {
            // Check if new name conflicts with existing manufacturer
            if self.exists_by_name(&name).await? {
                return Err(ServiceError::Conflict(format!(
                    "Manufacturer '{}' already exists",
                    name
                )));
            }
            active_model.name = Set(name);
        }
        if let Some(short_name) = data.short_name {
            active_model.short_name = Set(Some(short_name));
        }
        if let Some(country) = data.country {
            active_model.country = Set(Some(country));
        }
        if let Some(phone) = data.phone {
            active_model.phone = Set(Some(phone));
        }
        if let Some(email) = data.email {
            active_model.email = Set(Some(email));
        }
        if let Some(website) = data.website {
            active_model.website = Set(Some(website));
        }
        if let Some(notes) = data.notes {
            active_model.notes = Set(Some(notes));
        }
        if let Some(is_active) = data.is_active {
            active_model.is_active = Set(is_active);
        }

        let result = active_model
            .update(self.db.as_ref())
            .await
            .tap_ok(|m| tracing::info!("Updated manufacturer: {} ({})", m.name, m.id))
            .tap_err(|e| tracing::error!("Failed to update manufacturer {}: {}", id, e))?;

        Ok(result.into())
    }

    /// Delete a manufacturer (soft delete by setting is_active to false)
    pub async fn delete(&self, id: Id) -> ServiceResult<()> {
        let manufacturer = Manufacturer::find_by_id(id)
            .one(self.db.as_ref())
            .await?
            .ok_or_else(|| ServiceError::NotFound(format!("Manufacturer not found: {}", id)))?;

        let mut active_model: db_entity::manufacturer::ActiveModel = manufacturer.into();
        active_model.is_active = Set(false);

        active_model
            .update(self.db.as_ref())
            .await
            .tap_ok(|m| tracing::info!("Soft deleted manufacturer: {} ({})", m.name, m.id))
            .tap_err(|e| tracing::error!("Failed to delete manufacturer {}: {}", id, e))?;

        Ok(())
    }

    /// Hard delete a manufacturer (permanent deletion)
    pub async fn hard_delete(&self, id: Id) -> ServiceResult<()> {
        Manufacturer::delete_by_id(id)
            .exec(self.db.as_ref())
            .await
            .tap_ok(|_| tracing::info!("Hard deleted manufacturer: {}", id))
            .tap_err(|e| tracing::error!("Failed to hard delete manufacturer {}: {}", id, e))?;

        Ok(())
    }

    // ========================================================================
    // Helper Methods
    // ========================================================================

    /// Check if a manufacturer exists by ID
    pub async fn exists(&self, id: Id) -> ServiceResult<bool> {
        let count = Manufacturer::find_by_id(id).count(self.db.as_ref()).await?;
        Ok(count > 0)
    }

    /// Check if a manufacturer exists by name
    pub async fn exists_by_name(&self, name: &str) -> ServiceResult<bool> {
        let count = Manufacturer::find()
            .filter(db_entity::manufacturer::Column::Name.eq(name))
            .count(self.db.as_ref())
            .await?;
        Ok(count > 0)
    }
}

#[cfg(test)]
mod tests;
