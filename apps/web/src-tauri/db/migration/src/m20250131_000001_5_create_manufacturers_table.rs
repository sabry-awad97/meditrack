use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // ========================================
        // Create manufacturers table
        // ========================================
        manager
            .create_table(
                Table::create()
                    .table(Alias::new("manufacturers"))
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Manufacturer::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(Manufacturer::Name)
                            .string_len(200)
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(Manufacturer::ShortName)
                            .string_len(50)
                            .null(),
                    )
                    .col(ColumnDef::new(Manufacturer::Country).string_len(100).null())
                    .col(ColumnDef::new(Manufacturer::Phone).string_len(50).null())
                    .col(ColumnDef::new(Manufacturer::Email).string_len(100).null())
                    .col(ColumnDef::new(Manufacturer::Website).string_len(200).null())
                    .col(ColumnDef::new(Manufacturer::Notes).text().null())
                    .col(
                        ColumnDef::new(Manufacturer::IsActive)
                            .boolean()
                            .not_null()
                            .default(true),
                    )
                    .col(
                        ColumnDef::new(Manufacturer::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(Manufacturer::UpdatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;

        // Create indexes for manufacturers
        manager
            .create_index(
                Index::create()
                    .name("idx_manufacturers_name")
                    .table(Alias::new("manufacturers"))
                    .col(Manufacturer::Name)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_manufacturers_is_active")
                    .table(Alias::new("manufacturers"))
                    .col(Manufacturer::IsActive)
                    .to_owned(),
            )
            .await?;

        // Create trigger to auto-update updated_at for manufacturers
        manager
            .get_connection()
            .execute_unprepared(
                r#"
                CREATE TRIGGER update_manufacturers_updated_at
                    BEFORE UPDATE ON manufacturers
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
                "DROP TRIGGER IF EXISTS update_manufacturers_updated_at ON manufacturers;",
            )
            .await?;

        // Drop manufacturers table
        manager
            .drop_table(
                Table::drop()
                    .table(Alias::new("manufacturers"))
                    .if_exists()
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum Manufacturer {
    Id,
    Name,
    ShortName,
    Country,
    Phone,
    Email,
    Website,
    Notes,
    IsActive,
    CreatedAt,
    UpdatedAt,
}
