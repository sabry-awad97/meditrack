use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // ========================================
        // Create inventory_price_history table
        // ========================================
        manager
            .create_table(
                Table::create()
                    .table(Alias::new("inventory_price_history"))
                    .if_not_exists()
                    .col(
                        ColumnDef::new(InventoryPriceHistory::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(InventoryPriceHistory::InventoryItemId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(InventoryPriceHistory::UnitPrice)
                            .decimal_len(10, 2)
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(InventoryPriceHistory::RecordedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(InventoryPriceHistory::ChangedBy)
                            .uuid()
                            .null(),
                    )
                    .col(ColumnDef::new(InventoryPriceHistory::Reason).text().null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_price_history_inventory_item")
                            .from(
                                Alias::new("inventory_price_history"),
                                InventoryPriceHistory::InventoryItemId,
                            )
                            .to(Alias::new("inventory_items"), Alias::new("id"))
                            .on_delete(ForeignKeyAction::NoAction)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Create composite index on (inventory_item_id, recorded_at DESC)
        manager
            .get_connection()
            .execute_unprepared(
                "CREATE INDEX idx_price_history_item_time ON inventory_price_history (inventory_item_id, recorded_at DESC);",
            )
            .await?;

        // Create index on recorded_at for time-based queries
        manager
            .create_index(
                Index::create()
                    .name("idx_price_history_recorded_at")
                    .table(Alias::new("inventory_price_history"))
                    .col(InventoryPriceHistory::RecordedAt)
                    .to_owned(),
            )
            .await?;

        // Create trigger function to record price changes
        manager
            .get_connection()
            .execute_unprepared(
                r#"
                CREATE OR REPLACE FUNCTION record_price_change()
                RETURNS TRIGGER AS $$
                BEGIN
                    BEGIN
                        -- Only record if price actually changed
                        IF OLD.unit_price IS DISTINCT FROM NEW.unit_price THEN
                            INSERT INTO inventory_price_history (
                                id,
                                inventory_item_id,
                                unit_price,
                                recorded_at,
                                changed_by,
                                reason
                            ) VALUES (
                                gen_random_uuid(),
                                NEW.inventory_item_id,
                                NEW.unit_price,
                                NOW(),
                                NULL,
                                NULL
                            );
                        END IF;
                    EXCEPTION
                        WHEN OTHERS THEN
                            -- Log error but don't block the stock update
                            RAISE WARNING 'Failed to record price history: %', SQLERRM;
                    END;
                    
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
                "#,
            )
            .await?;

        // Attach trigger to inventory_stock table
        manager
            .get_connection()
            .execute_unprepared(
                r#"
                CREATE TRIGGER price_history_trigger
                    AFTER UPDATE OF unit_price ON inventory_stock
                    FOR EACH ROW
                    EXECUTE FUNCTION record_price_change();
                "#,
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop trigger
        manager
            .get_connection()
            .execute_unprepared("DROP TRIGGER IF EXISTS price_history_trigger ON inventory_stock;")
            .await?;

        // Drop function
        manager
            .get_connection()
            .execute_unprepared("DROP FUNCTION IF EXISTS record_price_change();")
            .await?;

        // Drop inventory_price_history table
        manager
            .drop_table(
                Table::drop()
                    .table(Alias::new("inventory_price_history"))
                    .if_exists()
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum InventoryPriceHistory {
    Id,
    InventoryItemId,
    UnitPrice,
    RecordedAt,
    ChangedBy,
    Reason,
}
