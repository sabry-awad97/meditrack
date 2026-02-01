use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // ========================================
        // Create medicine_forms table
        // ========================================
        manager
            .create_table(
                Table::create()
                    .table(Alias::new("medicine_forms"))
                    .if_not_exists()
                    .col(
                        ColumnDef::new(MedicineForm::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(MedicineForm::Code)
                            .string_len(50)
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(MedicineForm::NameEn)
                            .string_len(100)
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(MedicineForm::NameAr)
                            .string_len(100)
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(MedicineForm::DisplayOrder)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(MedicineForm::IsActive)
                            .boolean()
                            .not_null()
                            .default(true),
                    )
                    .col(
                        ColumnDef::new(MedicineForm::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(MedicineForm::UpdatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;

        // Create indexes for medicine_forms
        manager
            .create_index(
                Index::create()
                    .name("idx_medicine_forms_code")
                    .table(Alias::new("medicine_forms"))
                    .col(MedicineForm::Code)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_medicine_forms_display_order")
                    .table(Alias::new("medicine_forms"))
                    .col(MedicineForm::DisplayOrder)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_medicine_forms_is_active")
                    .table(Alias::new("medicine_forms"))
                    .col(MedicineForm::IsActive)
                    .to_owned(),
            )
            .await?;

        // Create trigger to auto-update updated_at for medicine_forms
        manager
            .get_connection()
            .execute_unprepared(
                r#"
                CREATE TRIGGER update_medicine_forms_updated_at
                    BEFORE UPDATE ON medicine_forms
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
                "#,
            )
            .await?;

        // ========================================
        // Populate medicine_forms with data
        // ========================================
        manager
            .get_connection()
            .execute_unprepared(
                r#"
                INSERT INTO medicine_forms (id, code, name_en, name_ar, display_order) VALUES
                (gen_random_uuid(), 'CAPLET', 'Caplet', 'أقراص عادي مكسوة', 1),
                (gen_random_uuid(), 'ORAL_INGESTA_TABLET', 'Oral Ingesta Tablet', 'أقراص تحت اللسان', 2),
                (gen_random_uuid(), 'COATED_TABLET', 'Coated Tablet', 'أقراص مغلفة', 3),
                (gen_random_uuid(), 'EFFERVESCENT_TABLET', 'Effervescent Tablet', 'أقراص فوارة', 4),
                (gen_random_uuid(), 'CHEWABLE_TABLET', 'Chewable Tablet', 'أقراص مضغ', 5),
                (gen_random_uuid(), 'LOZENGES', 'Lozenges', 'أقراص استحلاب', 6),
                (gen_random_uuid(), 'CAPSULE', 'Capsule', 'كبسولات', 7),
                (gen_random_uuid(), 'SPANSULE', 'Spansule', 'كبسولة ممتد المفعول', 8),
                (gen_random_uuid(), 'SYRUP', 'Syrup', 'شراب', 9),
                (gen_random_uuid(), 'SUSPENSION', 'Suspension', 'معلق', 10),
                (gen_random_uuid(), 'EMULSION', 'Emulsion', 'مستحلب', 11),
                (gen_random_uuid(), 'SOLUTION', 'Solution', 'محلول', 12),
                (gen_random_uuid(), 'AQUEOUS_SOLUTION', 'Aqueous Solution', 'محلول مائي', 13),
                (gen_random_uuid(), 'OILY_SOLUTION', 'Oily Solution', 'محلول زيتي', 14),
                (gen_random_uuid(), 'FOAMING_SOLUTION', 'Foaming Solution', 'محلول رغوي', 15),
                (gen_random_uuid(), 'BRUSHUPS', 'Brushups', 'محاليل', 16),
                (gen_random_uuid(), 'LIQUID', 'Liquid', 'سائل', 17),
                (gen_random_uuid(), 'OINT', 'Ointment', 'قطرة', 18),
                (gen_random_uuid(), 'GEL', 'Gel', 'جل', 19),
                (gen_random_uuid(), 'EYE_DROPS', 'Eye Drops', 'نقط عين', 20),
                (gen_random_uuid(), 'EAR_DROPS', 'Ear Drops', 'نقط أذن', 21),
                (gen_random_uuid(), 'NASAL_DROPS', 'Nasal Drops', 'نقط أنف', 22),
                (gen_random_uuid(), 'ORAL_DROPS', 'Oral Drops', 'نقط فموية', 23),
                (gen_random_uuid(), 'EYE_EAR_DROPS', 'Eye/Ear Drops', 'نقط عين وأذن', 24),
                (gen_random_uuid(), 'EYE_NOSE_DROPS', 'Eye/Nose Drops', 'نقط عين وأنف', 25),
                (gen_random_uuid(), 'SPRAY', 'Spray', 'بخاخ', 26),
                (gen_random_uuid(), 'VITAMIN_OIL', 'Vitamin Oil', 'زيت فيتامين', 27),
                (gen_random_uuid(), 'FIXED_OIL', 'Fixed Oil', 'زيت ثابت', 28),
                (gen_random_uuid(), 'HAIR_OIL', 'Hair Oil', 'زيت شعر', 29),
                (gen_random_uuid(), 'EXTRACT', 'Extract', 'مستخلص', 30),
                (gen_random_uuid(), 'INJECTABLE', 'Injectable', 'أمبولات', 31),
                (gen_random_uuid(), 'AMPOULE', 'Ampoule', 'أمبول', 32),
                (gen_random_uuid(), 'ENEMA', 'Enema', 'حقنة شرجية', 33),
                (gen_random_uuid(), 'SYRINGE', 'Syringe', 'سرنجات', 34),
                (gen_random_uuid(), 'READY_FILLED_SYRINGE', 'Ready Filled Syringe', 'سرنجة جاهزة للحقن', 35),
                (gen_random_uuid(), 'PARENTERAL_CATHETER', 'Parenteral/Catheter', 'قسطرة', 36),
                (gen_random_uuid(), 'CREAM', 'Cream', 'كريم', 37),
                (gen_random_uuid(), 'SUPPOSITORY', 'Suppository', 'لبوس', 38),
                (gen_random_uuid(), 'INHALER', 'Inhaler', 'بخاخ استنشاق', 39),
                (gen_random_uuid(), 'POWDER', 'Powder', 'بودرة', 40),
                (gen_random_uuid(), 'PATCH', 'Patch', 'لاصقة', 41),
                (gen_random_uuid(), 'LOTION', 'Lotion', 'لوشن', 42),
                (gen_random_uuid(), 'FOAM', 'Foam', 'رغوة', 43),
                (gen_random_uuid(), 'OTHER', 'Other', 'أخرى', 44);
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
                "DROP TRIGGER IF EXISTS update_medicine_forms_updated_at ON medicine_forms;",
            )
            .await?;

        // Drop medicine_forms table
        manager
            .drop_table(
                Table::drop()
                    .table(Alias::new("medicine_forms"))
                    .if_exists()
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum MedicineForm {
    Id,
    Code,
    NameEn,
    NameAr,
    DisplayOrder,
    IsActive,
    CreatedAt,
    UpdatedAt,
}
