/**
 * Inventory API
 *
 * Provides type-safe access to inventory-related operations.
 * Currently uses mock data for frontend development.
 * Ready for Tauri backend integration in the future.
 *
 * @module api/inventory
 */

import { z } from "zod";
import { createLogger } from "@/lib/logger";
import { mockInventoryItems } from "@/lib/inventory-mock-data";
import type {
  InventoryItem,
  InventoryItemFormData,
} from "@/lib/inventory-types";

const logger = createLogger("InventoryAPI");

// ============================================================================
// Schemas
// ============================================================================

/**
 * Inventory item ID schema
 */
export const InventoryItemIdSchema = z.string().uuid();
export type InventoryItemId = z.infer<typeof InventoryItemIdSchema>;

/**
 * Inventory item response schema (matches backend entity)
 */
export const InventoryItemResponseSchema = z.object({
  id: InventoryItemIdSchema,
  name: z.string(),
  genericName: z.string().nullable(),
  concentration: z.string(),
  form: z.string(),
  manufacturer: z.string().nullable(),
  barcode: z.string().nullable(),
  stockQuantity: z.number().int().nonnegative(),
  minStockLevel: z.number().int().nonnegative(),
  unitPrice: z.number().nonnegative(),
  requiresPrescription: z.boolean(),
  isControlled: z.boolean(),
  storageInstructions: z.string().nullable(),
  notes: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type InventoryItemResponse = z.infer<typeof InventoryItemResponseSchema>;

/**
 * Create inventory item DTO schema
 */
export const CreateInventoryItemSchema = z.object({
  name: z.string().min(1),
  genericName: z.string().optional(),
  concentration: z.string().min(1),
  form: z.string().min(1),
  manufacturer: z.string().optional(),
  barcode: z.string().optional(),
  stockQuantity: z.number().int().nonnegative(),
  minStockLevel: z.number().int().nonnegative(),
  unitPrice: z.number().nonnegative(),
  requiresPrescription: z.boolean(),
  isControlled: z.boolean(),
  storageInstructions: z.string().optional(),
  notes: z.string().optional(),
});
export type CreateInventoryItem = z.infer<typeof CreateInventoryItemSchema>;

/**
 * Update inventory item DTO schema
 */
export const UpdateInventoryItemSchema = z.object({
  name: z.string().min(1).optional(),
  genericName: z.string().optional(),
  concentration: z.string().min(1).optional(),
  form: z.string().min(1).optional(),
  manufacturer: z.string().optional(),
  barcode: z.string().optional(),
  stockQuantity: z.number().int().nonnegative().optional(),
  minStockLevel: z.number().int().nonnegative().optional(),
  unitPrice: z.number().nonnegative().optional(),
  requiresPrescription: z.boolean().optional(),
  isControlled: z.boolean().optional(),
  storageInstructions: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateInventoryItem = z.infer<typeof UpdateInventoryItemSchema>;

/**
 * Inventory query filters schema
 */
export const InventoryQuerySchema = z.object({
  search: z.string().optional(),
  form: z.string().optional(),
  requiresPrescription: z.boolean().optional(),
  isControlled: z.boolean().optional(),
  isActive: z.boolean().optional(),
  lowStock: z.boolean().optional(),
  outOfStock: z.boolean().optional(),
});
export type InventoryQuery = z.infer<typeof InventoryQuerySchema>;

/**
 * Mutation result schema
 */
export const MutationResultSchema = z.object({
  id: InventoryItemIdSchema,
});
export type MutationResult = z.infer<typeof MutationResultSchema>;

/**
 * Inventory statistics schema
 */
export const InventoryStatisticsSchema = z.object({
  total: z.number(),
  inStock: z.number(),
  lowStock: z.number(),
  outOfStock: z.number(),
  totalValue: z.number(),
});
export type InventoryStatistics = z.infer<typeof InventoryStatisticsSchema>;

// ============================================================================
// Mock Data Store (simulates database)
// ============================================================================

let inventoryStore: InventoryItem[] = [...mockInventoryItems];

/**
 * Simulate async delay for realistic API behavior
 */
const delay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// CRUD Operations (Mock Implementation)
// ============================================================================

/**
 * Create a new inventory item
 * TODO: Replace with Tauri command when backend is ready
 */
export async function createInventoryItem(
  data: CreateInventoryItem,
): Promise<MutationResult> {
  logger.info("Creating inventory item:", data.name);
  await delay();

  const newItem: InventoryItem = {
    id: crypto.randomUUID(),
    name: data.name,
    genericName: data.genericName || null,
    concentration: data.concentration,
    form: data.form,
    manufacturer: data.manufacturer || null,
    barcode: data.barcode || null,
    stockQuantity: data.stockQuantity,
    minStockLevel: data.minStockLevel,
    unitPrice: data.unitPrice,
    requiresPrescription: data.requiresPrescription,
    isControlled: data.isControlled,
    storageInstructions: data.storageInstructions || null,
    notes: data.notes || null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  inventoryStore.push(newItem);
  logger.info("Inventory item created:", newItem.id);

  return { id: newItem.id };
}

/**
 * Get inventory item by ID
 * TODO: Replace with Tauri command when backend is ready
 */
export async function getInventoryItem(
  id: InventoryItemId,
): Promise<InventoryItemResponse> {
  logger.info("Getting inventory item:", id);
  await delay();

  const item = inventoryStore.find((i) => i.id === id);
  if (!item) {
    throw new Error(`Inventory item not found: ${id}`);
  }

  return item;
}

/**
 * Update inventory item
 * TODO: Replace with Tauri command when backend is ready
 */
export async function updateInventoryItem(
  id: InventoryItemId,
  data: UpdateInventoryItem,
): Promise<MutationResult> {
  logger.info("Updating inventory item:", id);
  await delay();

  const index = inventoryStore.findIndex((i) => i.id === id);
  if (index === -1) {
    throw new Error(`Inventory item not found: ${id}`);
  }

  inventoryStore[index] = {
    ...inventoryStore[index],
    ...data,
    updatedAt: new Date(),
  };

  logger.info("Inventory item updated:", id);
  return { id };
}

/**
 * Delete inventory item (soft delete)
 * TODO: Replace with Tauri command when backend is ready
 */
export async function deleteInventoryItem(
  id: InventoryItemId,
): Promise<MutationResult> {
  logger.info("Deleting inventory item:", id);
  await delay();

  const index = inventoryStore.findIndex((i) => i.id === id);
  if (index === -1) {
    throw new Error(`Inventory item not found: ${id}`);
  }

  inventoryStore[index] = {
    ...inventoryStore[index],
    isActive: false,
    updatedAt: new Date(),
  };

  logger.info("Inventory item deleted:", id);
  return { id };
}

/**
 * List inventory items with filtering
 * TODO: Replace with Tauri command when backend is ready
 */
export async function listInventoryItems(
  filter?: InventoryQuery,
): Promise<InventoryItemResponse[]> {
  logger.info("Listing inventory items with filter:", filter);
  await delay();

  let items = [...inventoryStore];

  // Apply filters
  if (filter) {
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.genericName?.toLowerCase().includes(searchLower) ||
          item.barcode?.toLowerCase().includes(searchLower),
      );
    }

    if (filter.form) {
      items = items.filter((item) => item.form === filter.form);
    }

    if (filter.requiresPrescription !== undefined) {
      items = items.filter(
        (item) => item.requiresPrescription === filter.requiresPrescription,
      );
    }

    if (filter.isControlled !== undefined) {
      items = items.filter((item) => item.isControlled === filter.isControlled);
    }

    if (filter.isActive !== undefined) {
      items = items.filter((item) => item.isActive === filter.isActive);
    }

    if (filter.lowStock) {
      items = items.filter(
        (item) =>
          item.stockQuantity > 0 && item.stockQuantity <= item.minStockLevel,
      );
    }

    if (filter.outOfStock) {
      items = items.filter((item) => item.stockQuantity === 0);
    }
  }

  logger.info(`Found ${items.length} inventory items`);
  return items;
}

// ============================================================================
// Stock Management
// ============================================================================

/**
 * Update stock quantity
 * TODO: Replace with Tauri command when backend is ready
 */
export async function updateStock(
  id: InventoryItemId,
  quantity: number,
): Promise<MutationResult> {
  logger.info(`Updating stock for item: ${id}, quantity: ${quantity}`);
  await delay();

  const index = inventoryStore.findIndex((i) => i.id === id);
  if (index === -1) {
    throw new Error(`Inventory item not found: ${id}`);
  }

  inventoryStore[index] = {
    ...inventoryStore[index],
    stockQuantity: quantity,
    updatedAt: new Date(),
  };

  logger.info("Stock updated for item:", id);
  return { id };
}

/**
 * Adjust stock (add or subtract)
 * TODO: Replace with Tauri command when backend is ready
 */
export async function adjustStock(
  id: InventoryItemId,
  adjustment: number,
): Promise<MutationResult> {
  logger.info(`Adjusting stock for item: ${id}, adjustment: ${adjustment}`);
  await delay();

  const index = inventoryStore.findIndex((i) => i.id === id);
  if (index === -1) {
    throw new Error(`Inventory item not found: ${id}`);
  }

  const newQuantity = Math.max(
    0,
    inventoryStore[index].stockQuantity + adjustment,
  );

  inventoryStore[index] = {
    ...inventoryStore[index],
    stockQuantity: newQuantity,
    updatedAt: new Date(),
  };

  logger.info(`Stock adjusted for item: ${id}, new quantity: ${newQuantity}`);
  return { id };
}

// ============================================================================
// Specialized Queries
// ============================================================================

/**
 * Get low stock items
 * TODO: Replace with Tauri command when backend is ready
 */
export async function getLowStockItems(): Promise<InventoryItemResponse[]> {
  logger.info("Getting low stock items");
  return listInventoryItems({ lowStock: true, isActive: true });
}

/**
 * Get out of stock items
 * TODO: Replace with Tauri command when backend is ready
 */
export async function getOutOfStockItems(): Promise<InventoryItemResponse[]> {
  logger.info("Getting out of stock items");
  return listInventoryItems({ outOfStock: true, isActive: true });
}

/**
 * Get controlled substances
 * TODO: Replace with Tauri command when backend is ready
 */
export async function getControlledSubstances(): Promise<
  InventoryItemResponse[]
> {
  logger.info("Getting controlled substances");
  return listInventoryItems({ isControlled: true, isActive: true });
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Get inventory statistics
 * TODO: Replace with Tauri command when backend is ready
 */
export async function getInventoryStatistics(): Promise<InventoryStatistics> {
  logger.info("Getting inventory statistics");
  await delay();

  const activeItems = inventoryStore.filter((item) => item.isActive);

  const stats: InventoryStatistics = {
    total: activeItems.length,
    inStock: activeItems.filter(
      (item) => item.stockQuantity > item.minStockLevel,
    ).length,
    lowStock: activeItems.filter(
      (item) =>
        item.stockQuantity > 0 && item.stockQuantity <= item.minStockLevel,
    ).length,
    outOfStock: activeItems.filter((item) => item.stockQuantity === 0).length,
    totalValue: activeItems.reduce(
      (sum, item) => sum + item.stockQuantity * item.unitPrice,
      0,
    ),
  };

  logger.info("Inventory statistics:", stats);
  return stats;
}

// ============================================================================
// Development Utilities
// ============================================================================

/**
 * Reset inventory to mock data (development only)
 */
export async function resetInventory(): Promise<void> {
  logger.warn("Resetting inventory to mock data");
  await delay();
  inventoryStore = [...mockInventoryItems];
  logger.info("Inventory reset complete");
}

/**
 * Clear all inventory items (development only)
 */
export async function clearInventory(): Promise<void> {
  logger.warn("Clearing all inventory items");
  await delay();
  inventoryStore = [];
  logger.info("Inventory cleared");
}

// ============================================================================
// Exports
// ============================================================================

export const inventoryApi = {
  // CRUD
  create: createInventoryItem,
  get: getInventoryItem,
  update: updateInventoryItem,
  delete: deleteInventoryItem,
  list: listInventoryItems,

  // Stock Management
  updateStock,
  adjustStock,

  // Specialized Queries
  getLowStock: getLowStockItems,
  getOutOfStock: getOutOfStockItems,
  getControlled: getControlledSubstances,

  // Statistics
  getStatistics: getInventoryStatistics,

  // Development
  reset: resetInventory,
  clear: clearInventory,
} as const;
