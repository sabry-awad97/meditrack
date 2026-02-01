/**
 * Medicine Forms API
 *
 * Provides type-safe access to medicine form-related Tauri commands.
 * All functions handle both Tauri and browser environments gracefully.
 *
 * @module api/medicine-forms
 */

import { z } from "zod";
import { invokeCommand, type PaginationParams } from "@/lib/tauri-api";
import { createLogger } from "@/lib/logger";

const logger = createLogger("MedicineFormsAPI");

// ============================================================================
// Schemas
// ============================================================================

/**
 * Medicine Form ID schema
 */
export const MedicineFormIdSchema = z.string().uuid();
export type MedicineFormId = z.infer<typeof MedicineFormIdSchema>;

/**
 * Medicine Form response schema
 */
export const MedicineFormResponseSchema = z.object({
  id: MedicineFormIdSchema,
  code: z.string(),
  name_en: z.string(),
  name_ar: z.string(),
  display_order: z.number().int(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type MedicineFormResponse = z.infer<typeof MedicineFormResponseSchema>;

/**
 * Create medicine form DTO schema
 */
export const CreateMedicineFormSchema = z.object({
  code: z.string().min(1).max(50),
  name_en: z.string().min(1).max(100),
  name_ar: z.string().min(1).max(100),
  display_order: z.number().int(),
});
export type CreateMedicineForm = z.infer<typeof CreateMedicineFormSchema>;

/**
 * Update medicine form DTO schema
 */
export const UpdateMedicineFormSchema = z.object({
  code: z.string().min(1).max(50).optional(),
  name_en: z.string().min(1).max(100).optional(),
  name_ar: z.string().min(1).max(100).optional(),
  display_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});
export type UpdateMedicineForm = z.infer<typeof UpdateMedicineFormSchema>;

/**
 * Medicine form query filters schema
 */
export const MedicineFormQuerySchema = z.object({
  id: MedicineFormIdSchema.optional(),
  code: z.string().optional(),
  is_active: z.boolean().optional(),
});
export type MedicineFormQuery = z.infer<typeof MedicineFormQuerySchema>;

/**
 * Pagination result schema
 */
export const PaginationResultSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    page_size: z.number(),
    total_pages: z.number(),
  });
export type PaginationResult<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

/**
 * Mutation result schema
 */
export const MutationResultSchema = z.object({
  id: MedicineFormIdSchema,
});
export type MutationResult = z.infer<typeof MutationResultSchema>;

/**
 * Exists result schema
 */
export const ExistsResultSchema = z.object({
  exists: z.boolean(),
});
export type ExistsResult = z.infer<typeof ExistsResultSchema>;

/**
 * Usage count result schema
 */
export const UsageCountResultSchema = z.object({
  count: z.number().int(),
});
export type UsageCountResult = z.infer<typeof UsageCountResultSchema>;

/**
 * Reorder medicine forms DTO schema
 */
export const ReorderMedicineFormsSchema = z.object({
  form_ids: z.array(MedicineFormIdSchema),
});
export type ReorderMedicineForms = z.infer<typeof ReorderMedicineFormsSchema>;

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Create a new medicine form
 */
export async function createMedicineForm(
  data: CreateMedicineForm,
): Promise<MutationResult> {
  logger.info("Creating medicine form:", data.code);
  return invokeCommand("create_medicine_form", MutationResultSchema, {
    params: { data },
  });
}

/**
 * Get medicine form by ID
 */
export async function getMedicineForm(
  id: MedicineFormId,
): Promise<MedicineFormResponse> {
  logger.info("Getting medicine form:", id);
  return invokeCommand("get_medicine_form", MedicineFormResponseSchema, {
    params: { id },
  });
}

/**
 * Update medicine form
 */
export async function updateMedicineForm(
  id: MedicineFormId,
  data: UpdateMedicineForm,
): Promise<MutationResult> {
  logger.info("Updating medicine form:", id);
  return invokeCommand("update_medicine_form", MutationResultSchema, {
    params: { id, data },
  });
}

/**
 * Delete medicine form (soft delete)
 */
export async function deleteMedicineForm(
  id: MedicineFormId,
): Promise<MutationResult> {
  logger.info("Deleting medicine form:", id);
  return invokeCommand("delete_medicine_form", MutationResultSchema, {
    params: { id },
  });
}

/**
 * List medicine forms with filtering and pagination
 */
export async function listMedicineForms(
  filter?: MedicineFormQuery,
  pagination?: PaginationParams,
): Promise<PaginationResult<MedicineFormResponse>> {
  logger.info("Listing medicine forms with filter:", filter);
  return invokeCommand(
    "list_medicine_forms",
    PaginationResultSchema(MedicineFormResponseSchema),
    {
      params: {
        filter: filter || null,
        pagination: pagination || null,
      },
    },
  );
}

// ============================================================================
// Medicine Form Retrieval
// ============================================================================

/**
 * Get medicine form by code
 */
export async function getMedicineFormByCode(
  code: string,
): Promise<MedicineFormResponse> {
  logger.info("Getting medicine form by code:", code);
  return invokeCommand(
    "get_medicine_form_by_code",
    MedicineFormResponseSchema,
    {
      code,
    },
  );
}

/**
 * Get all active medicine forms
 */
export async function listActiveMedicineForms(): Promise<
  MedicineFormResponse[]
> {
  logger.info("Getting all active medicine forms");
  return invokeCommand(
    "list_active_medicine_forms",
    z.array(MedicineFormResponseSchema),
    {},
  );
}

// ============================================================================
// Medicine Form Management
// ============================================================================

/**
 * Restore a soft-deleted medicine form
 */
export async function restoreMedicineForm(
  id: MedicineFormId,
): Promise<MedicineFormResponse> {
  logger.info("Restoring medicine form:", id);
  return invokeCommand("restore_medicine_form", MedicineFormResponseSchema, {
    params: { id },
  });
}

/**
 * Check if medicine form exists by ID
 */
export async function medicineFormExists(
  id: MedicineFormId,
): Promise<ExistsResult> {
  logger.info("Checking if medicine form exists:", id);
  return invokeCommand("medicine_form_exists", ExistsResultSchema, {
    params: { id },
  });
}

/**
 * Check if medicine form exists by code
 */
export async function medicineFormExistsByCode(
  code: string,
): Promise<ExistsResult> {
  logger.info("Checking if medicine form exists by code:", code);
  return invokeCommand("medicine_form_exists_by_code", ExistsResultSchema, {
    code,
  });
}

/**
 * Get usage count for a medicine form
 */
export async function getMedicineFormUsageCount(
  id: MedicineFormId,
): Promise<UsageCountResult> {
  logger.info("Getting usage count for medicine form:", id);
  return invokeCommand(
    "get_medicine_form_usage_count",
    UsageCountResultSchema,
    {
      params: { id },
    },
  );
}

/**
 * Reorder medicine forms
 */
export async function reorderMedicineForms(
  data: ReorderMedicineForms,
): Promise<void> {
  logger.info("Reordering medicine forms");
  return invokeCommand("reorder_medicine_forms", z.void(), {
    params: { data },
  });
}

// ============================================================================
// Exports
// ============================================================================

export const medicineFormsApi = {
  // CRUD
  create: createMedicineForm,
  get: getMedicineForm,
  update: updateMedicineForm,
  delete: deleteMedicineForm,
  list: listMedicineForms,

  // Retrieval
  getByCode: getMedicineFormByCode,
  listActive: listActiveMedicineForms,

  // Management
  restore: restoreMedicineForm,
  exists: medicineFormExists,
  existsByCode: medicineFormExistsByCode,
  getUsageCount: getMedicineFormUsageCount,
  reorder: reorderMedicineForms,
} as const;
