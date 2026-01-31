/**
 * Manufacturer Hooks
 *
 * React Query hooks for manufacturer management.
 * Provides type-safe access to manufacturer operations with automatic cache management.
 *
 * @module hooks/use-manufacturers
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "@meditrack/i18n";
import { manufacturerApi } from "@/api/manufacturer.api";
import { createLogger } from "@/lib/logger";
import type {
  ManufacturerId,
  CreateManufacturer,
  UpdateManufacturer,
} from "@/api/manufacturer.api";

const logger = createLogger("ManufacturerHooks");

// ============================================================================
// Query Keys
// ============================================================================

export const manufacturerKeys = {
  all: ["manufacturers"] as const,
  lists: () => [...manufacturerKeys.all, "list"] as const,
  list: (activeOnly: boolean) =>
    [...manufacturerKeys.lists(), { activeOnly }] as const,
  listActive: () => [...manufacturerKeys.lists(), "active"] as const,
  details: () => [...manufacturerKeys.all, "detail"] as const,
  detail: (id: ManufacturerId) => [...manufacturerKeys.details(), id] as const,
  byName: (name: string) => [...manufacturerKeys.all, "name", name] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get all manufacturers with optional filtering
 */
export function useManufacturers(activeOnly: boolean = false) {
  return useQuery({
    queryKey: manufacturerKeys.list(activeOnly),
    queryFn: () => manufacturerApi.list(activeOnly),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Get all active manufacturers (for dropdowns)
 */
export function useActiveManufacturers() {
  return useQuery({
    queryKey: manufacturerKeys.listActive(),
    queryFn: () => manufacturerApi.listActive(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Get a single manufacturer by ID
 */
export function useManufacturer(
  id: ManufacturerId,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: manufacturerKeys.detail(id),
    queryFn: () => manufacturerApi.get(id),
    enabled: options?.enabled ?? !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Get manufacturer by name
 */
export function useManufacturerByName(
  name: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: manufacturerKeys.byName(name),
    queryFn: () => manufacturerApi.getByName(name),
    enabled: (options?.enabled ?? true) && name.length > 0,
    staleTime: 1000 * 60 * 10,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new manufacturer
 */
export function useCreateManufacturer() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: (data: CreateManufacturer) => manufacturerApi.create(data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: manufacturerKeys.lists() });
      toast.success(
        t("messages.created", {
          item: "Manufacturer",
          name: variables.name,
        }) || `Manufacturer "${variables.name}" created successfully`,
      );
      logger.info("Manufacturer created:", _result.id);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create manufacturer: ${error.message}`);
      logger.error("Failed to create manufacturer:", error);
    },
  });
}

/**
 * Update an existing manufacturer
 */
export function useUpdateManufacturer() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: ManufacturerId;
      data: UpdateManufacturer;
    }) => manufacturerApi.update(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: manufacturerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: manufacturerKeys.detail(id) });
      toast.success(
        t("messages.updated", { item: "Manufacturer" }) ||
          "Manufacturer updated successfully",
      );
      logger.info("Manufacturer updated:", id);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update manufacturer: ${error.message}`);
      logger.error("Failed to update manufacturer:", error);
    },
  });
}

/**
 * Delete a manufacturer (soft delete)
 */
export function useDeleteManufacturer() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: (id: ManufacturerId) => manufacturerApi.delete(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: manufacturerKeys.detail(id) });
      toast.success(
        t("messages.deleted", { item: "Manufacturer" }) ||
          "Manufacturer deleted successfully",
      );
      logger.info("Manufacturer deleted:", id);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete manufacturer: ${error.message}`);
      logger.error("Failed to delete manufacturer:", error);
    },
  });
}

/**
 * Permanently delete a manufacturer (hard delete - admin only)
 */
export function useHardDeleteManufacturer() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: (id: ManufacturerId) => manufacturerApi.hardDelete(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturerKeys.lists() });
      queryClient.removeQueries({ queryKey: manufacturerKeys.detail(id) });
      toast.success(
        t("messages.permanentlyDeleted", { item: "Manufacturer" }) ||
          "Manufacturer permanently deleted",
      );
      logger.warn("Manufacturer permanently deleted:", id);
    },
    onError: (error: Error) => {
      toast.error(
        `Failed to permanently delete manufacturer: ${error.message}`,
      );
      logger.error("Failed to permanently delete manufacturer:", error);
    },
  });
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Prefetch manufacturer data for better UX
 */
export function usePrefetchManufacturer() {
  const queryClient = useQueryClient();

  return (id: ManufacturerId) => {
    queryClient.prefetchQuery({
      queryKey: manufacturerKeys.detail(id),
      queryFn: () => manufacturerApi.get(id),
      staleTime: 1000 * 60 * 10,
    });
  };
}

/**
 * Invalidate all manufacturer queries
 */
export function useInvalidateManufacturers() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: manufacturerKeys.all });
    logger.info("All manufacturer queries invalidated");
  };
}
