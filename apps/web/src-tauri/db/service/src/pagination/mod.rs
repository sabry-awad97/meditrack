use serde::{Deserialize, Serialize};

/// Pagination parameters for database queries
#[derive(Debug, Clone, Copy, Deserialize, Serialize)]
pub struct PaginationParams {
    page: u64,
    page_size: u64,
}

impl PaginationParams {
    pub fn new(page: u64, page_size: u64) -> Self {
        Self {
            page: page.max(1),
            page_size: page_size.clamp(1, 100),
        }
    }

    /// Get the page number
    pub fn page(&self) -> u64 {
        self.page
    }

    /// Get the page size
    pub fn page_size(&self) -> u64 {
        self.page_size
    }
}

impl Default for PaginationParams {
    fn default() -> Self {
        Self {
            page: 1,
            page_size: 10,
        }
    }
}

/// Generic pagination result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginationResult<T> {
    items: Vec<T>,
    total: u64,
    page: u64,
    page_size: u64,
    total_pages: u64,
}

impl<T> PaginationResult<T> {
    pub fn new(items: Vec<T>, total: u64, page: u64, page_size: u64) -> Self {
        let total_pages = if page_size > 0 {
            (total as f64 / page_size as f64).ceil() as u64
        } else {
            0
        };

        Self {
            items,
            total,
            page,
            page_size,
            total_pages,
        }
    }

    /// Get the items (consumes self)
    pub fn items(self) -> Vec<T> {
        self.items
    }

    /// Get a reference to the items
    pub fn items_ref(&self) -> &[T] {
        &self.items
    }

    /// Get the total count
    pub fn total(&self) -> u64 {
        self.total
    }

    /// Get the page number
    pub fn page(&self) -> u64 {
        self.page
    }

    /// Get the page size
    pub fn page_size(&self) -> u64 {
        self.page_size
    }

    /// Get the total pages
    pub fn total_pages(&self) -> u64 {
        self.total_pages
    }
}
