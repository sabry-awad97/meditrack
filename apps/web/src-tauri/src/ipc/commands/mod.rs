pub mod inventory;
pub mod manufacturer;
pub mod onboarding;
pub mod session;
pub mod settings;
pub mod user;

pub use user::{
    // Authentication & Security
    change_password,
    // CRUD operations
    create_user,
    delete_user,
    // User Management
    delete_user_permanently,
    // User Retrieval
    get_active_users,
    get_user,
    get_user_by_staff_id,
    get_user_by_username,
    // Statistics
    get_user_statistics,
    get_user_with_staff,
    list_users,
    login_user,
    reset_password,
    restore_user,
    update_user,
};

pub use onboarding::{check_first_run, complete_first_run_setup, complete_first_run_setup_default};

pub use settings::{
    // CRUD operations
    delete_setting,
    delete_setting_by_id,
    // Category operations
    delete_setting_category,
    get_setting,
    // Typed getters
    get_setting_bool,
    get_setting_by_id,
    get_setting_categories,
    get_setting_number,
    get_setting_string,
    get_settings_by_category,
    // Statistics
    get_settings_statistics,
    list_settings,
    // Bulk operations
    set_multiple_settings,
    set_setting,
    // Existence checks
    setting_exists,
    update_setting,
};

pub use inventory::{
    // Barcode management
    add_barcode,
    // Stock management
    adjust_inventory_stock,
    // CRUD operations
    create_inventory_item,
    // Medicine Forms
    create_medicine_form,
    delete_inventory_item,
    delete_medicine_form,
    get_inventory_item,
    get_inventory_item_by_barcode,
    // Statistics
    get_inventory_statistics,
    get_item_barcodes,
    // Price history
    get_latest_price,
    // Stock history
    get_latest_stock_adjustment,
    // Listing & filtering
    get_low_stock_items,
    get_medicine_form,
    get_medicine_form_by_code,
    get_medicine_form_usage_count,
    get_out_of_stock_items,
    get_price_history,
    get_price_statistics,
    get_stock_history,
    get_stock_history_statistics,
    list_active_inventory_items,
    list_active_medicine_forms,
    list_medicine_forms,
    medicine_form_exists,
    medicine_form_exists_by_code,
    remove_barcode,
    reorder_medicine_forms,
    restore_inventory_item,
    restore_medicine_form,
    search_inventory_items,
    set_primary_barcode,
    update_barcode,
    update_inventory_item,
    update_inventory_stock,
    update_medicine_form,
};

pub use manufacturer::{
    create_manufacturer, create_manufacturers_bulk, delete_manufacturer, get_manufacturer,
    get_manufacturer_by_name, hard_delete_manufacturer, list_manufacturers, update_manufacturer,
};

pub use session::{
    cleanup_expired_sessions, get_user_sessions, logout_all_sessions, logout_session,
    validate_session,
};
