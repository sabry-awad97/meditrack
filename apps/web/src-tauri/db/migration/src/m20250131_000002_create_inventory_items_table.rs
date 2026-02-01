use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // ========================================
        // Create inventory_items table (Catalog/Master Data)
        // ========================================
        manager
            .create_table(
                Table::create()
                    .table(Alias::new("inventory_items"))
                    .if_not_exists()
                    .col(
                        ColumnDef::new(InventoryItem::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(InventoryItem::Name)
                            .string_len(200)
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(InventoryItem::GenericName)
                            .string_len(200)
                            .null(),
                    )
                    .col(
                        ColumnDef::new(InventoryItem::Concentration)
                            .string_len(50)
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(InventoryItem::MedicineFormId)
                            .uuid()
                            .not_null(),
                    )
                    .col(ColumnDef::new(InventoryItem::ManufacturerId).uuid().null())
                    .col(
                        ColumnDef::new(InventoryItem::RequiresPrescription)
                            .boolean()
                            .not_null()
                            .default(false),
                    )
                    .col(
                        ColumnDef::new(InventoryItem::IsControlled)
                            .boolean()
                            .not_null()
                            .default(false),
                    )
                    .col(
                        ColumnDef::new(InventoryItem::StorageInstructions)
                            .text()
                            .null(),
                    )
                    .col(ColumnDef::new(InventoryItem::Notes).text().null())
                    .col(
                        ColumnDef::new(InventoryItem::IsActive)
                            .boolean()
                            .not_null()
                            .default(true),
                    )
                    .col(ColumnDef::new(InventoryItem::CreatedBy).uuid().null())
                    .col(ColumnDef::new(InventoryItem::UpdatedBy).uuid().null())
                    .col(
                        ColumnDef::new(InventoryItem::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(InventoryItem::UpdatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(InventoryItem::DeletedAt)
                            .timestamp_with_time_zone()
                            .null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_inventory_items_manufacturer")
                            .from(Alias::new("inventory_items"), InventoryItem::ManufacturerId)
                            .to(Alias::new("manufacturers"), Alias::new("id"))
                            .on_delete(ForeignKeyAction::SetNull)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_inventory_items_medicine_form")
                            .from(Alias::new("inventory_items"), InventoryItem::MedicineFormId)
                            .to(Alias::new("medicine_forms"), Alias::new("id"))
                            .on_delete(ForeignKeyAction::Restrict)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Create indexes for inventory_items
        manager
            .create_index(
                Index::create()
                    .name("idx_inventory_items_name")
                    .table(Alias::new("inventory_items"))
                    .col(InventoryItem::Name)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_inventory_items_generic_name")
                    .table(Alias::new("inventory_items"))
                    .col(InventoryItem::GenericName)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_inventory_items_medicine_form_id")
                    .table(Alias::new("inventory_items"))
                    .col(InventoryItem::MedicineFormId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_inventory_items_is_active")
                    .table(Alias::new("inventory_items"))
                    .col(InventoryItem::IsActive)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_inventory_items_manufacturer_id")
                    .table(Alias::new("inventory_items"))
                    .col(InventoryItem::ManufacturerId)
                    .to_owned(),
            )
            .await?;

        // Partial index for active items (soft delete)
        manager
            .get_connection()
            .execute_unprepared(
                "CREATE INDEX idx_inventory_items_active ON inventory_items (id) WHERE deleted_at IS NULL;",
            )
            .await?;

        // Create trigger to auto-update updated_at for inventory_items
        manager
            .get_connection()
            .execute_unprepared(
                r#"
                CREATE TRIGGER update_inventory_items_updated_at
                    BEFORE UPDATE ON inventory_items
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
                "#,
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop trigger
        manager
            .get_connection()
            .execute_unprepared(
                "DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;",
            )
            .await?;

        // Drop inventory_items table
        manager
            .drop_table(
                Table::drop()
                    .table(Alias::new("inventory_items"))
                    .if_exists()
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum InventoryItem {
    Id,
    Name,
    GenericName,
    Concentration,
    MedicineFormId,
    ManufacturerId,
    RequiresPrescription,
    IsControlled,
    StorageInstructions,
    Notes,
    IsActive,
    CreatedBy,
    UpdatedBy,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
}
