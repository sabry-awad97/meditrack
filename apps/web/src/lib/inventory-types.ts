import { z } from "zod";

// ========== Inventory Item Types ==========

/**
 * Schema for inventory item stock status
 */
export const StockStatusSchema = z.enum([
  "in_stock", // متوفر
  "low_stock", // مخزون منخفض
  "out_of_stock", // نفذ من المخزون
]);

/**
 * Schema for inventory item
 */
export const InventoryItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  genericName: z.string().nullable(),
  concentration: z.string().min(1),
  form: z.string().min(1),
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

/**
 * Schema for inventory item form data (create/update)
 */
export const InventoryItemFormDataSchema = z.object({
  name: z.string().min(1, "Name is required"),
  genericName: z.string().optional(),
  concentration: z.string().min(1, "Concentration is required"),
  form: z.string().min(1, "Form is required"),
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

// ========== Exported Types ==========

export type StockStatus = z.infer<typeof StockStatusSchema>;
export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type InventoryItemFormData = z.infer<typeof InventoryItemFormDataSchema>;

// ========== Helper Functions ==========

/**
 * Calculate stock status based on quantity and minimum level
 */
export function getStockStatus(
  stockQuantity: number,
  minStockLevel: number,
): StockStatus {
  if (stockQuantity === 0) return "out_of_stock";
  if (stockQuantity <= minStockLevel) return "low_stock";
  return "in_stock";
}

/**
 * Get stock status color
 */
export function getStockStatusColor(status: StockStatus): string {
  switch (status) {
    case "in_stock":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "low_stock":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "out_of_stock":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  }
}

/**
 * Get stock status label
 */
export function getStockStatusLabel(status: StockStatus): string {
  switch (status) {
    case "in_stock":
      return "In Stock";
    case "low_stock":
      return "Low Stock";
    case "out_of_stock":
      return "Out of Stock";
  }
}
