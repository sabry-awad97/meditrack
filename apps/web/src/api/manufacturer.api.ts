/**
 * Manufacturer API
 *
 * Provides type-safe access to manufacturer-related Tauri commands.
 * All functions handle both Tauri and browser environments gracefully.
 *
 * @module api/manufacturer
 */

import { z } from "zod";
import { invokeCommand, type PaginationParams } from "@/lib/tauri-api";
import { createLogger } from "@/lib/logger";

const logger = createLogger("ManufacturerAPI");

// ============================================================================
// Schemas
// ============================================================================

/**
 * Manufacturer ID schema
 */
export const ManufacturerIdSchema = z.string().uuid();
export type ManufacturerId = z.infer<typeof ManufacturerIdSchema>;

/**
 * Manufacturer response schema (matches backend ManufacturerResponse)
 */
export const ManufacturerResponseSchema = z.object({
  id: ManufacturerIdSchema,
  name: z.string(),
  short_name: z.string().nullable(),
  country: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable(),
  notes: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type ManufacturerResponse = z.infer<typeof ManufacturerResponseSchema>;

/**
 * Create manufacturer DTO schema (matches backend CreateManufacturer)
 */
export const CreateManufacturerSchema = z.object({
  name: z.string().min(1),
  short_name: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  notes: z.string().optional(),
});
export type CreateManufacturer = z.infer<typeof CreateManufacturerSchema>;

/**
 * Update manufacturer DTO schema (matches backend UpdateManufacturer)
 */
export const UpdateManufacturerSchema = z.object({
  name: z.string().min(1).optional(),
  short_name: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  notes: z.string().optional(),
  is_active: z.boolean().optional(),
});
export type UpdateManufacturer = z.infer<typeof UpdateManufacturerSchema>;

/**
 * Mutation result schema
 */
export const MutationResultSchema = z.object({
  id: ManufacturerIdSchema,
});
export type MutationResult = z.infer<typeof MutationResultSchema>;

/**
 * Manufacturer query filters schema (matches backend ManufacturerQueryDto)
 */
export const ManufacturerQuerySchema = z.object({
  id: ManufacturerIdSchema.optional(),
  name: z.string().optional(),
  country: z.string().optional(),
  is_active: z.boolean().optional(),
  include_deleted: z.boolean().optional(),
});
export type ManufacturerQuery = z.infer<typeof ManufacturerQuerySchema>;

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

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Create a new manufacturer
 */
export async function createManufacturer(
  data: CreateManufacturer,
): Promise<MutationResult> {
  logger.info("Creating manufacturer:", data.name);
  return invokeCommand("create_manufacturer", MutationResultSchema, {
    params: { data },
  });
}

/**
 * Create multiple manufacturers in bulk (optimized for seeding/imports)
 */
export async function createManufacturersBulk(
  data: CreateManufacturer[],
): Promise<MutationResult[]> {
  logger.info("Bulk creating manufacturers:", data.length);
  return invokeCommand(
    "create_manufacturers_bulk",
    z.array(MutationResultSchema),
    { params: { data } },
  );
}

/**
 * Get manufacturer by ID
 */
export async function getManufacturer(
  id: ManufacturerId,
): Promise<ManufacturerResponse> {
  logger.info("Getting manufacturer:", id);
  return invokeCommand("get_manufacturer", ManufacturerResponseSchema, {
    params: { id },
  });
}

/**
 * Update manufacturer
 */
export async function updateManufacturer(
  id: ManufacturerId,
  data: UpdateManufacturer,
): Promise<MutationResult> {
  logger.info("Updating manufacturer:", id);
  return invokeCommand("update_manufacturer", MutationResultSchema, {
    params: { id, data },
  });
}

/**
 * Delete manufacturer (soft delete)
 */
export async function deleteManufacturer(
  id: ManufacturerId,
): Promise<MutationResult> {
  logger.info("Deleting manufacturer:", id);
  return invokeCommand("delete_manufacturer", MutationResultSchema, {
    params: { id },
  });
}

// ============================================================================
// Retrieval Operations
// ============================================================================

/**
 * Get manufacturer by name
 */
export async function getManufacturerByName(
  name: string,
): Promise<ManufacturerResponse> {
  logger.info("Getting manufacturer by name:", name);
  return invokeCommand("get_manufacturer_by_name", ManufacturerResponseSchema, {
    name,
  });
}

/**
 * List manufacturers with filtering and pagination
 */
export async function listManufacturers(
  filter?: ManufacturerQuery,
  pagination?: PaginationParams,
): Promise<PaginationResult<ManufacturerResponse>> {
  logger.info("Listing manufacturers with filter:", filter);
  return invokeCommand(
    "list_manufacturers",
    PaginationResultSchema(ManufacturerResponseSchema),
    {
      params: {
        filter: filter || null,
        pagination: pagination || null,
      },
    },
  );
}

/**
 * List active manufacturers (for dropdowns)
 * This is a convenience method that uses listManufacturers with is_active filter
 */
export async function listActiveManufacturers(): Promise<
  ManufacturerResponse[]
> {
  logger.info("Listing active manufacturers");
  const result = await listManufacturers({ is_active: true });
  return result.items;
}

// ============================================================================
// Management Operations
// ============================================================================

/**
 * Permanently delete a manufacturer (hard delete - admin only)
 */
export async function hardDeleteManufacturer(
  id: ManufacturerId,
): Promise<MutationResult> {
  logger.warn("Permanently deleting manufacturer:", id);
  return invokeCommand("hard_delete_manufacturer", MutationResultSchema, {
    params: { id },
  });
}

// ============================================================================
// Exports
// ============================================================================

export const manufacturerApi = {
  // CRUD
  create: createManufacturer,
  createBulk: createManufacturersBulk,
  get: getManufacturer,
  update: updateManufacturer,
  delete: deleteManufacturer,

  // Retrieval
  getByName: getManufacturerByName,
  list: listManufacturers,
  listActive: listActiveManufacturers,

  // Management
  hardDelete: hardDeleteManufacturer,
} as const;
