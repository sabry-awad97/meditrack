use db_entity::id::Id;
use db_entity::medicine_form::dto::{
    CreateMedicineForm, MedicineFormQueryDto, MedicineFormResponse, UpdateMedicineForm,
};
use db_service::PaginationResult;
use tap::TapFallible;
use tauri::{AppHandle, Manager};

use crate::ipc::params::DeleteParams;
use crate::{
    error::AppResult,
    ipc::{
        params::{CreateParams, GetParams, ListParams, UpdateParams},
        response::{IpcResponse, MutationResult},
    },
    state::AppState,
};

// ============================================================================
// Helper Functions
// ============================================================================

/// Helper to get medicine forms service from app state
#[inline]
fn get_medicine_forms_service(app: &AppHandle) -> std::sync::Arc<db_service::MedicineFormsService> {
    let state = app.state::<AppState>();
    let service_manager = state.service_manager();
    service_manager.medicine_forms().clone()
}

// ============================================================================
// CRUD Operations
// ============================================================================

/// Create a new medicine form
#[tauri::command]
pub async fn create_medicine_form(
    app: AppHandle,
    params: CreateParams<CreateMedicineForm>,
) -> IpcResponse<MutationResult> {
    let result: AppResult<MutationResult> = async {
        get_medicine_forms_service(&app)
            .create(params.data().clone())
            .await
            .tap_ok(|form| {
                tracing::info!(
                    "Created medicine form: {} ({}) - ID: {}",
                    form.code,
                    form.name_en,
                    form.id
                )
            })
            .tap_err(|e| tracing::error!("Failed to create medicine form: {}", e))
            .map(|form| MutationResult::from(form.id))
            .map_err(Into::into)
    }
    .await;
    result.into()
}

/// Get medicine form by ID
#[tauri::command]
pub async fn get_medicine_form(
    app: AppHandle,
    params: GetParams,
) -> IpcResponse<MedicineFormResponse> {
    let result: AppResult<MedicineFormResponse> = async {
        get_medicine_forms_service(&app)
            .get_by_id(*params.id())
            .await
            .tap_ok(|form| {
                tracing::debug!(
                    "Retrieved medicine form: {} ({}) - ID: {}",
                    form.code,
                    form.name_en,
                    form.id
                )
            })
            .tap_err(|e| tracing::error!("Failed to get medicine form {}: {}", params.id(), e))
            .map_err(Into::into)
    }
    .await;
    result.into()
}

/// Get medicine form by code
#[tauri::command]
pub async fn get_medicine_form_by_code(
    app: AppHandle,
    code: String,
) -> IpcResponse<MedicineFormResponse> {
    let result: AppResult<MedicineFormResponse> = async {
        get_medicine_forms_service(&app)
            .get_by_code(&code)
            .await
            .tap_ok(|form| {
                tracing::debug!(
                    "Retrieved medicine form by code {}: {} - ID: {}",
                    code,
                    form.name_en,
                    form.id
                )
            })
            .tap_err(|e| tracing::error!("Failed to get medicine form by code '{}': {}", code, e))
            .map_err(Into::into)
    }
    .await;
    result.into()
}

/// List medicine forms with filtering and pagination
#[tauri::command]
pub async fn list_medicine_forms(
    app: AppHandle,
    params: ListParams<MedicineFormQueryDto>,
) -> IpcResponse<PaginationResult<MedicineFormResponse>> {
    let result: AppResult<PaginationResult<MedicineFormResponse>> = async {
        let query = params.filter().clone().unwrap_or_default();
        let pagination = *params.pagination();

        get_medicine_forms_service(&app)
            .list(query, pagination)
            .await
            .tap_ok(|result| {
                tracing::debug!(
                    "Listed {} medicine forms (page {} of {})",
                    result.items_ref().len(),
                    result.page(),
                    result.total_pages()
                )
            })
            .tap_err(|e| tracing::error!("Failed to list medicine forms: {}", e))
            .map_err(Into::into)
    }
    .await;
    result.into()
}

/// Get all active medicine forms (for dropdowns)
#[tauri::command]
pub async fn list_active_medicine_forms(app: AppHandle) -> IpcResponse<Vec<MedicineFormResponse>> {
    let result: AppResult<Vec<MedicineFormResponse>> = async {
        get_medicine_forms_service(&app)
            .list_active()
            .await
            .tap_ok(|forms| tracing::debug!("Listed {} active medicine forms", forms.len()))
            .tap_err(|e| tracing::error!("Failed to list active medicine forms: {}", e))
            .map_err(Into::into)
    }
    .await;
    result.into()
}

/// Update a medicine form
#[tauri::command]
pub async fn update_medicine_form(
    app: AppHandle,
    params: UpdateParams<UpdateMedicineForm>,
) -> IpcResponse<MutationResult> {
    let result: AppResult<MutationResult> = async {
        get_medicine_forms_service(&app)
            .update(*params.id(), params.data().clone())
            .await
            .tap_ok(|form| {
                tracing::info!(
                    "Updated medicine form: {} ({}) - ID: {}",
                    form.code,
                    form.name_en,
                    form.id
                )
            })
            .tap_err(|e| tracing::error!("Failed to update medicine form {}: {}", params.id(), e))
            .map(|form| MutationResult::from(form.id))
            .map_err(Into::into)
    }
    .await;
    result.into()
}

/// Delete a medicine form (soft delete)
#[tauri::command]
pub async fn delete_medicine_form(
    app: AppHandle,
    params: DeleteParams,
) -> IpcResponse<MutationResult> {
    let result: AppResult<MutationResult> = async {
        get_medicine_forms_service(&app)
            .delete(*params.id())
            .await
            .tap_ok(|_| tracing::info!("Deleted medicine form: {}", params.id()))
            .tap_err(|e| tracing::error!("Failed to delete medicine form {}: {}", params.id(), e))
            .map(|_| MutationResult::from(*params.id()))
            .map_err(Into::into)
    }
    .await;
    result.into()
}

/// Restore a soft-deleted medicine form
#[tauri::command]
pub async fn restore_medicine_form(
    app: AppHandle,
    params: GetParams,
) -> IpcResponse<MutationResult> {
    let result: AppResult<MutationResult> = async {
        get_medicine_forms_service(&app)
            .restore(*params.id())
            .await
            .tap_ok(|form| {
                tracing::info!(
                    "Restored medicine form: {} ({}) - ID: {}",
                    form.code,
                    form.name_en,
                    form.id
                )
            })
            .tap_err(|e| tracing::error!("Failed to restore medicine form {}: {}", params.id(), e))
            .map(|form| MutationResult::from(form.id))
            .map_err(Into::into)
    }
    .await;
    result.into()
}

// ============================================================================
// Helper Operations
// ============================================================================

/// Check if a medicine form exists by ID
#[tauri::command]
pub async fn medicine_form_exists(app: AppHandle, params: GetParams) -> IpcResponse<bool> {
    let result: AppResult<bool> = async {
        get_medicine_forms_service(&app)
            .exists(*params.id())
            .await
            .tap_ok(|exists| tracing::debug!("Medicine form {} exists: {}", params.id(), exists))
            .tap_err(|e| {
                tracing::error!(
                    "Failed to check if medicine form {} exists: {}",
                    params.id(),
                    e
                )
            })
            .map_err(Into::into)
    }
    .await;
    result.into()
}

/// Check if a medicine form exists by code
#[tauri::command]
pub async fn medicine_form_exists_by_code(app: AppHandle, code: String) -> IpcResponse<bool> {
    let result: AppResult<bool> = async {
        get_medicine_forms_service(&app)
            .exists_by_code(&code)
            .await
            .tap_ok(|exists| {
                tracing::debug!("Medicine form with code '{}' exists: {}", code, exists)
            })
            .tap_err(|e| {
                tracing::error!(
                    "Failed to check if medicine form with code '{}' exists: {}",
                    code,
                    e
                )
            })
            .map_err(Into::into)
    }
    .await;
    result.into()
}

/// Get usage count for a medicine form
#[tauri::command]
pub async fn get_medicine_form_usage_count(app: AppHandle, params: GetParams) -> IpcResponse<u64> {
    let result: AppResult<u64> = async {
        get_medicine_forms_service(&app)
            .get_usage_count(*params.id())
            .await
            .tap_ok(|count| {
                tracing::debug!(
                    "Medicine form {} is used by {} inventory items",
                    params.id(),
                    count
                )
            })
            .tap_err(|e| {
                tracing::error!(
                    "Failed to get usage count for medicine form {}: {}",
                    params.id(),
                    e
                )
            })
            .map_err(Into::into)
    }
    .await;
    result.into()
}

/// Reorder medicine forms
#[tauri::command]
pub async fn reorder_medicine_forms(
    app: AppHandle,
    orders: Vec<(Id, i32)>,
) -> IpcResponse<MutationResult> {
    let result: AppResult<MutationResult> = async {
        get_medicine_forms_service(&app)
            .reorder(orders.clone())
            .await
            .tap_ok(|_| tracing::info!("Reordered {} medicine forms", orders.len()))
            .tap_err(|e| tracing::error!("Failed to reorder medicine forms: {}", e))
            .map(|_| MutationResult::from(Id::NIL))
            .map_err(Into::into)
    }
    .await;
    result.into()
}
