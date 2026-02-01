/**
 * Medicine Forms Management Hooks
 *
 * Professional TanStack Query hooks for medicine form operations.
 * Provides optimistic updates, automatic cache invalidation,
 * and intuitive error handling.
 *
 * @module hooks/use-medicine-forms
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createLogger } from "@/lib/logger";
import {
  medicineFormsApi,
  type MedicineFormResponse,
  type CreateMedicineForm,
  type UpdateMedicineForm,
  type MedicineFormQuery,
  type MedicineFormId,
  type ReorderMedicineForms,
} from "@/api/medicine-forms.api";
import type { PaginationParams } from "@/lib/tauri-api";

const logger = createLogger("MedicineFormsHooks");

// ============================================================================
// Query Keys Factory
// ============================================================================

/**
 * Centralized query keys for medicine form-related queries
 * Follows TanStack Query best practices for key management
 */
export const medicineFormKeys = {
  all: ["medicine-forms"] as const,
  lists: () => [...medicineFormKeys.all, "list"] as const,
  list: (filters?: MedicineFormQuery, pagination?: PaginationParams) =>
    [...medicineFormKeys.lists(), { filters, pagination }] as const,
  details: () => [...medicineFormKeys.all, "detail"] as const,
  detail: (id: MedicineFormId) => [...medicineFormKeys.details(), id] as const,
  byCode: (code: string) => [...medicineFormKeys.all, "code", code] as const,
  active: () => [...medicineFormKeys.all, "active"] as const,
  usageCount: (id: MedicineFormId) =>
    [...medicineFormKeys.detail(id), "usage"] as const,
} as const;

// ============================================================================
// Query Hooks (Data Fetching)
// ============================================================================

/**
 * Fetch a single medicine form by ID
 *
 * @param id - Medicine Form ID
 * @param options - Query options
 * @returns Query result with medicine form data
 *
 * @example
 * ```tsx
 * const { data: form, isLoading, error } = useMedicineForm(formId);
 * ```
 */
export function useMedicineForm(
  id: MedicineFormId,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: medicineFormKeys.detail(id),
    queryFn: () => medicineFormsApi.get(id),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch medicine form by code
 *
 * @param code - Medicine form code to search for
 * @param options - Query options
 * @returns Query result with medicine form data
 *
 * @example
 * ```tsx
 * const { data: form } = useMedicineFormByCode('TABLET');
 * ```
 */
export function useMedicineFormByCode(
  code: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: medicineFormKeys.byCode(code),
    queryFn: () => medicineFormsApi.getByCode(code),
    enabled: (options?.enabled ?? true) && code.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch list of medicine forms with filtering and pagination
 *
 * @param filters - Optional filters
 * @param pagination - Optional pagination params
 * @returns Query result with paginated medicine form list
 *
 * @example
 * ```tsx
 * const { data: forms } = useMedicineForms(
 *   { is_active: true },
 *   { page: 1, page_size: 10 }
 * );
 * ```
 */
export function useMedicineForms(
  filters?: MedicineFormQuery,
  pagination?: PaginationParams,
) {
  return useQuery({
    queryKey: medicineFormKeys.list(filters, pagination),
    queryFn: () => medicineFormsApi.list(filters, pagination),
    staleTime: 1000 * 60 * 2, // 2 minutes for lists
  });
}

/**
 * Fetch all active medicine forms
 *
 * @returns Query result with active medicine forms
 *
 * @example
 * ```tsx
 * const { data: activeForms } = useActiveMedicineForms();
 * ```
 */
export function useActiveMedicineForms() {
  return useQuery({
    queryKey: medicineFormKeys.active(),
    queryFn: () => medicineFormsApi.listActive(),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Fetch usage count for a medicine form
 *
 * @param id - Medicine Form ID
 * @param options - Query options
 * @returns Query result with usage count
 *
 * @example
 * ```tsx
 * const { data: usage } = useMedicineFormUsageCount(formId);
 * // usage: { count: 42 }
 * ```
 */
export function useMedicineFormUsageCount(
  id: MedicineFormId,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: medicineFormKeys.usageCount(id),
    queryFn: () => medicineFormsApi.getUsageCount(id),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 1, // 1 minute for usage stats
  });
}

// ============================================================================
// Mutation Hooks (Data Modification)
// ============================================================================

/**
 * Create a new medicine form
 *
 * Features:
 * - Optimistic updates
 * - Automatic cache invalidation
 * - Toast notifications
 * - Error handling
 *
 * @returns Mutation object with mutate function
 *
 * @example
 * ```tsx
 * const createForm = useCreateMedicineForm();
 *
 * createForm.mutate(formData, {
 *   onSuccess: (result) => {
 *     console.log('Form created:', result.id);
 *   },
 * });
 * ```
 */
export function useCreateMedicineForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMedicineForm) => medicineFormsApi.create(data),
    onSuccess: (result, variables) => {
      // Invalidate and refetch medicine form lists
      queryClient.invalidateQueries({ queryKey: medicineFormKeys.lists() });
      queryClient.invalidateQueries({ queryKey: medicineFormKeys.active() });

      toast.success(
        `Medicine form "${variables.name_en}" created successfully`,
      );
      logger.info("Medicine form created:", result.id);
    },
    onError: (error: Error, variables) => {
      toast.error(`Failed to create medicine form: ${error.message}`);
      logger.error("Failed to create medicine form:", error);
    },
  });
}

/**
 * Update an existing medicine form
 *
 * Features:
 * - Optimistic updates
 * - Automatic cache invalidation
 * - Toast notifications
 *
 * @returns Mutation object with mutate function
 *
 * @example
 * ```tsx
 * const updateForm = useUpdateMedicineForm();
 *
 * updateForm.mutate({
 *   id: formId,
 *   data: { name_en: 'Tablets' },
 * });
 * ```
 */
export function useUpdateMedicineForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: MedicineFormId;
      data: UpdateMedicineForm;
    }) => medicineFormsApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: medicineFormKeys.detail(id),
      });

      // Snapshot previous value
      const previousForm = queryClient.getQueryData<MedicineFormResponse>(
        medicineFormKeys.detail(id),
      );

      // Optimistically update
      if (previousForm) {
        queryClient.setQueryData<MedicineFormResponse>(
          medicineFormKeys.detail(id),
          {
            ...previousForm,
            ...data,
            updated_at: new Date().toISOString(),
          },
        );
      }

      return { previousForm };
    },
    onSuccess: (result, { id }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: medicineFormKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: medicineFormKeys.lists() });
      queryClient.invalidateQueries({ queryKey: medicineFormKeys.active() });

      toast.success("Medicine form updated successfully");
      logger.info("Medicine form updated:", id);
    },
    onError: (error: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousForm) {
        queryClient.setQueryData(
          medicineFormKeys.detail(id),
          context.previousForm,
        );
      }

      toast.error(`Failed to update medicine form: ${error.message}`);
      logger.error("Failed to update medicine form:", error);
    },
  });
}

/**
 * Delete a medicine form (soft delete)
 *
 * @returns Mutation object with mutate function
 *
 * @example
 * ```tsx
 * const deleteForm = useDeleteMedicineForm();
 *
 * deleteForm.mutate(formId);
 * ```
 */
export function useDeleteMedicineForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: MedicineFormId) => medicineFormsApi.delete(id),
    onSuccess: (result, id) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: medicineFormKeys.lists() });
      queryClient.invalidateQueries({ queryKey: medicineFormKeys.active() });
      queryClient.removeQueries({ queryKey: medicineFormKeys.detail(id) });

      toast.success("Medicine form deleted successfully");
      logger.info("Medicine form deleted:", id);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete medicine form: ${error.message}`);
      logger.error("Failed to delete medicine form:", error);
    },
  });
}

/**
 * Restore a soft-deleted medicine form
 *
 * @returns Mutation object with mutate function
 *
 * @example
 * ```tsx
 * const restoreForm = useRestoreMedicineForm();
 *
 * restoreForm.mutate(formId);
 * ```
 */
export function useRestoreMedicineForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: MedicineFormId) => medicineFormsApi.restore(id),
    onSuccess: (form) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: medicineFormKeys.lists() });
      queryClient.invalidateQueries({ queryKey: medicineFormKeys.active() });
      queryClient.setQueryData(medicineFormKeys.detail(form.id), form);

      toast.success(`Medicine form "${form.name_en}" restored successfully`);
      logger.info("Medicine form restored:", form.id);
    },
    onError: (error: Error) => {
      toast.error(`Failed to restore medicine form: ${error.message}`);
      logger.error("Failed to restore medicine form:", error);
    },
  });
}

/**
 * Reorder medicine forms
 *
 * @returns Mutation object with mutate function
 *
 * @example
 * ```tsx
 * const reorderForms = useReorderMedicineForms();
 *
 * reorderForms.mutate({
 *   form_ids: [id1, id2, id3],
 * });
 * ```
 */
export function useReorderMedicineForms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderMedicineForms) => medicineFormsApi.reorder(data),
    onSuccess: () => {
      // Invalidate all lists to reflect new order
      queryClient.invalidateQueries({ queryKey: medicineFormKeys.lists() });
      queryClient.invalidateQueries({ queryKey: medicineFormKeys.active() });

      toast.success("Medicine forms reordered successfully");
      logger.info("Medicine forms reordered");
    },
    onError: (error: Error) => {
      toast.error(`Failed to reorder medicine forms: ${error.message}`);
      logger.error("Failed to reorder medicine forms:", error);
    },
  });
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Prefetch medicine form data for better UX
 *
 * @param id - Medicine Form ID to prefetch
 *
 * @example
 * ```tsx
 * // Prefetch on hover
 * <Link
 *   to={`/medicine-forms/${formId}`}
 *   onMouseEnter={() => prefetchMedicineForm(formId)}
 * >
 *   View Form
 * </Link>
 * ```
 */
export function usePrefetchMedicineForm() {
  const queryClient = useQueryClient();

  return (id: MedicineFormId) => {
    queryClient.prefetchQuery({
      queryKey: medicineFormKeys.detail(id),
      queryFn: () => medicineFormsApi.get(id),
      staleTime: 1000 * 60 * 5,
    });
  };
}

/**
 * Invalidate all medicine form queries
 * Useful after bulk operations or external updates
 *
 * @example
 * ```tsx
 * const invalidateForms = useInvalidateMedicineForms();
 *
 * // After bulk import
 * invalidateForms();
 * ```
 */
export function useInvalidateMedicineForms() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: medicineFormKeys.all });
    logger.info("All medicine form queries invalidated");
  };
}
