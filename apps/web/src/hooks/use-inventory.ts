/**
 * Inventory Hooks
 *
 * React Query hooks for inventory management.
 * Uses mock API that's ready for Tauri backend integration.
 *
 * @module hooks/use-inventory
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { inventoryApi } from "@/api/inventory.api";
import type {
  InventoryItem,
  InventoryItemFormData,
} from "@/lib/inventory-types";
import type { InventoryQuery } from "@/api/inventory.api";
import { createLogger } from "@/lib/logger";

const logger = createLogger("InventoryHooks");

// ============================================================================
// Query Keys
// ============================================================================

export const inventoryKeys = {
  all: ["inventory"] as const,
  lists: () => [...inventoryKeys.all, "list"] as const,
  list: (filters?: InventoryQuery) =>
    [...inventoryKeys.lists(), filters] as const,
  details: () => [...inventoryKeys.all, "detail"] as const,
  detail: (id: string) => [...inventoryKeys.details(), id] as const,
  statistics: () => [...inventoryKeys.all, "statistics"] as const,
  lowStock: () => [...inventoryKeys.all, "lowStock"] as const,
  outOfStock: () => [...inventoryKeys.all, "outOfStock"] as const,
  controlled: () => [...inventoryKeys.all, "controlled"] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get all inventory items with optional filtering
 */
export function useInventoryItems(filters?: InventoryQuery) {
  return useQuery({
    queryKey: inventoryKeys.list(filters),
    queryFn: () => inventoryApi.list(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get a single inventory item by ID
 */
export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: () => inventoryApi.get(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get inventory statistics
 */
export function useInventoryStatistics() {
  return useQuery({
    queryKey: inventoryKeys.statistics(),
    queryFn: () => inventoryApi.getStatistics(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Get low stock items
 */
export function useLowStockItems() {
  return useQuery({
    queryKey: inventoryKeys.lowStock(),
    queryFn: () => inventoryApi.getLowStock(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Get out of stock items
 */
export function useOutOfStockItems() {
  return useQuery({
    queryKey: inventoryKeys.outOfStock(),
    queryFn: () => inventoryApi.getOutOfStock(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Get controlled substances
 */
export function useControlledSubstances() {
  return useQuery({
    queryKey: inventoryKeys.controlled(),
    queryFn: () => inventoryApi.getControlled(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new inventory item
 */
export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InventoryItemFormData) => inventoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.statistics() });
      toast.success("Inventory item created successfully");
      logger.info("Inventory item created");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create item: ${error.message}`);
      logger.error("Failed to create inventory item:", error);
    },
  });
}

/**
 * Update an existing inventory item
 */
export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<InventoryItemFormData>;
    }) => inventoryApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.statistics() });
      toast.success("Inventory item updated successfully");
      logger.info("Inventory item updated:", variables.id);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update item: ${error.message}`);
      logger.error("Failed to update inventory item:", error);
    },
  });
}

/**
 * Delete an inventory item (soft delete)
 */
export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.statistics() });
      toast.success("Inventory item deleted successfully");
      logger.info("Inventory item deleted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete item: ${error.message}`);
      logger.error("Failed to delete inventory item:", error);
    },
  });
}

/**
 * Update stock quantity
 */
export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      inventoryApi.updateStock(id, quantity),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.outOfStock() });
      toast.success("Stock updated successfully");
      logger.info("Stock updated for item:", variables.id);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update stock: ${error.message}`);
      logger.error("Failed to update stock:", error);
    },
  });
}

/**
 * Adjust stock (add or subtract)
 */
export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, adjustment }: { id: string; adjustment: number }) =>
      inventoryApi.adjustStock(id, adjustment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.outOfStock() });
      const action = variables.adjustment > 0 ? "added to" : "removed from";
      toast.success(`Stock ${action} successfully`);
      logger.info("Stock adjusted for item:", variables.id);
    },
    onError: (error: Error) => {
      toast.error(`Failed to adjust stock: ${error.message}`);
      logger.error("Failed to adjust stock:", error);
    },
  });
}

// ============================================================================
// Development Utilities
// ============================================================================

/**
 * Reset inventory to mock data (development only)
 */
export function useResetInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => inventoryApi.reset(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      toast.success("Inventory reset to mock data");
      logger.info("Inventory reset");
    },
    onError: (error: Error) => {
      toast.error(`Failed to reset inventory: ${error.message}`);
      logger.error("Failed to reset inventory:", error);
    },
  });
}

/**
 * Clear all inventory items (development only)
 */
export function useClearInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => inventoryApi.clear(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      toast.success("All inventory items cleared");
      logger.info("Inventory cleared");
    },
    onError: (error: Error) => {
      toast.error(`Failed to clear inventory: ${error.message}`);
      logger.error("Failed to clear inventory:", error);
    },
  });
}
