use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // ========================================
        // Create inventory_item_barcodes table
        // ========================================
        manager
            .create_table(
                Table::create()
                    .table(Alias::new("inventory_item_barcodes"))
                    .if_not_exists()
                    .col(
                        ColumnDef::new(InventoryItemBarcode::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(InventoryItemBarcode::InventoryItemId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(InventoryItemBarcode::Barcode)
                            .string_len(100)
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(InventoryItemBarcode::BarcodeType)
                            .string_len(50)
                            .null(),
                    )
                    .col(
                        ColumnDef::new(InventoryItemBarcode::IsPrimary)
                            .boolean()
                            .not_null()
                            .default(false),
                    )
                    .col(
                        ColumnDef::new(InventoryItemBarcode::Description)
                            .text()
                            .null(),
                    )
                    .col(
                        ColumnDef::new(InventoryItemBarcode::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(InventoryItemBarcode::CreatedBy)
                            .uuid()
                            .null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_barcode_inventory_item")
                            .from(
                                Alias::new("inventory_item_barcodes"),
                                InventoryItemBarcode::InventoryItemId,
                            )
                            .to(Alias::new("inventory_items"), Alias::new("id"))
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Create indexes for inventory_item_barcodes
        manager
            .create_index(
                Index::create()
                    .name("idx_barcodes_inventory_item_id")
                    .table(Alias::new("inventory_item_barcodes"))
                    .col(InventoryItemBarcode::InventoryItemId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_barcodes_barcode")
                    .table(Alias::new("inventory_item_barcodes"))
                    .col(InventoryItemBarcode::Barcode)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_barcodes_type")
                    .table(Alias::new("inventory_item_barcodes"))
                    .col(InventoryItemBarcode::BarcodeType)
                    .to_owned(),
            )
            .await?;

        // Partial unique index to ensure only one primary barcode per item
        manager
            .get_connection()
            .execute_unprepared(
                "CREATE UNIQUE INDEX idx_barcodes_unique_primary ON inventory_item_barcodes (inventory_item_id) WHERE is_primary = TRUE;",
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop inventory_item_barcodes table
        manager
            .drop_table(
                Table::drop()
                    .table(Alias::new("inventory_item_barcodes"))
                    .if_exists()
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum InventoryItemBarcode {
    Id,
    InventoryItemId,
    Barcode,
    BarcodeType,
    IsPrimary,
    Description,
    CreatedAt,
    CreatedBy,
}
