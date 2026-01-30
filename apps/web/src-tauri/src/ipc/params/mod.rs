use db_entity::id::Id;
use derive_getters::Getters;
use serde::Deserialize;

/// POST request parameters - for creating/submitting data
#[derive(Deserialize, Debug, Getters)]
pub struct CreateParams<D> {
    data: D,
}

/// PUT/PATCH request parameters - for updating data
#[derive(Deserialize, Debug, Getters)]
pub struct UpdateParams<D> {
    id: Id,
    data: D,
}

/// GET request parameters - for fetching a single item by ID
#[derive(Deserialize, Debug, Getters)]
pub struct GetParams {
    id: Id,
}

/// DELETE request parameters - for deleting data by ID
#[derive(Deserialize, Debug, Getters)]
pub struct DeleteParams {
    id: Id,
    deleted_by: Option<Id>,
}

/// List request parameters with optional filtering and pagination
#[derive(Deserialize, Debug, Getters)]
pub struct ListParams<F> {
    filter: Option<F>,
    pagination: Option<db_service::PaginationParams>,
}
