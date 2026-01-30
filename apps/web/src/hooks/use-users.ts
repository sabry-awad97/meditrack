/**
 * User Management Hooks
 *
 * Professional TanStack Query hooks for user operations.
 * Provides optimistic updates, automatic cache invalidation,
 * and intuitive error handling.
 *
 * @module hooks/use-users
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createLogger } from "@/lib/logger";
import {
  userApi,
  type UserResponse,
  type CreateUser,
  type UpdateUser,
  type Login,
  type ChangePassword,
  type ResetPassword,
  type UserQuery,
  type UserId,
} from "@/api/user.api";
import type { PaginationParams } from "@/lib/tauri-api";

const logger = createLogger("UserHooks");

// ============================================================================
// Query Keys Factory
// ============================================================================

/**
 * Centralized query keys for user-related queries
 * Follows TanStack Query best practices for key management
 */
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters?: UserQuery, pagination?: PaginationParams) =>
    [...userKeys.lists(), { filters, pagination }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: UserId) => [...userKeys.details(), id] as const,
  withStaff: (id: UserId) => [...userKeys.detail(id), "staff"] as const,
  byUsername: (username: string) =>
    [...userKeys.all, "username", username] as const,
  byStaffId: (staffId: UserId) =>
    [...userKeys.all, "staffId", staffId] as const,
  active: () => [...userKeys.all, "active"] as const,
  statistics: () => [...userKeys.all, "statistics"] as const,
} as const;

// ============================================================================
// Query Hooks (Data Fetching)
// ============================================================================

/**
 * Fetch a single user by ID
 *
 * @param id - User ID
 * @param options - Query options
 * @returns Query result with user data
 *
 * @example
 * ```tsx
 * const { data: user, isLoading, error } = useUser(userId);
 * ```
 */
export function useUser(id: UserId, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.get(id),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch user with full staff information
 *
 * @param id - User ID
 * @param options - Query options
 * @returns Query result with user and staff data
 *
 * @example
 * ```tsx
 * const { data: userWithStaff } = useUserWithStaff(userId);
 * ```
 */
export function useUserWithStaff(id: UserId, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.withStaff(id),
    queryFn: () => userApi.getWithStaff(id),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch user by username
 *
 * @param username - Username to search for
 * @param options - Query options
 * @returns Query result with user data
 *
 * @example
 * ```tsx
 * const { data: user } = useUserByUsername('john.doe');
 * ```
 */
export function useUserByUsername(
  username: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: userKeys.byUsername(username),
    queryFn: () => userApi.getByUsername(username),
    enabled: (options?.enabled ?? true) && username.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch user by staff ID
 *
 * @param staffId - Staff ID
 * @param options - Query options
 * @returns Query result with user data
 *
 * @example
 * ```tsx
 * const { data: user } = useUserByStaffId(staffId);
 * ```
 */
export function useUserByStaffId(
  staffId: UserId,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: userKeys.byStaffId(staffId),
    queryFn: () => userApi.getByStaffId(staffId),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch list of users with filtering and pagination
 *
 * @param filters - Optional filters
 * @param pagination - Optional pagination params
 * @returns Query result with paginated user list
 *
 * @example
 * ```tsx
 * const { data: users } = useUsers(
 *   { is_active: true },
 *   { page: 1, page_size: 10 }
 * );
 * ```
 */
export function useUsers(filters?: UserQuery, pagination?: PaginationParams) {
  return useQuery({
    queryKey: userKeys.list(filters, pagination),
    queryFn: () => userApi.list(filters, pagination),
    staleTime: 1000 * 60 * 2, // 2 minutes for lists
  });
}

/**
 * Fetch all active users
 *
 * @returns Query result with active users
 *
 * @example
 * ```tsx
 * const { data: activeUsers } = useActiveUsers();
 * ```
 */
export function useActiveUsers() {
  return useQuery({
    queryKey: userKeys.active(),
    queryFn: () => userApi.getActive(),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Fetch user statistics
 *
 * @returns Query result with user statistics
 *
 * @example
 * ```tsx
 * const { data: stats } = useUserStatistics();
 * // stats: { total, active, inactive, suspended }
 * ```
 */
export function useUserStatistics() {
  return useQuery({
    queryKey: userKeys.statistics(),
    queryFn: () => userApi.getStatistics(),
    staleTime: 1000 * 60 * 1, // 1 minute for stats
  });
}

// ============================================================================
// Mutation Hooks (Data Modification)
// ============================================================================

/**
 * Create a new user
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
 * const createUser = useCreateUser();
 *
 * createUser.mutate(userData, {
 *   onSuccess: (result) => {
 *     console.log('User created:', result.id);
 *   },
 * });
 * ```
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUser) => userApi.create(data),
    onSuccess: (result, variables) => {
      // Invalidate and refetch user lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() });

      toast.success(`User "${variables.username}" created successfully`);
      logger.info("User created:", result.id);
    },
    onError: (error: Error, variables) => {
      toast.error(`Failed to create user: ${error.message}`);
      logger.error("Failed to create user:", error);
    },
  });
}

/**
 * Update an existing user
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
 * const updateUser = useUpdateUser();
 *
 * updateUser.mutate({
 *   id: userId,
 *   data: { first_name: 'John' },
 * });
 * ```
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: UserId; data: UpdateUser }) =>
      userApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.detail(id) });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<UserResponse>(
        userKeys.detail(id),
      );

      // Optimistically update
      if (previousUser) {
        queryClient.setQueryData<UserResponse>(userKeys.detail(id), {
          ...previousUser,
          ...data,
          updated_at: new Date().toISOString(),
        });
      }

      return { previousUser };
    },
    onSuccess: (result, { id }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.withStaff(id) });

      toast.success("User updated successfully");
      logger.info("User updated:", id);
    },
    onError: (error: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.detail(id), context.previousUser);
      }

      toast.error(`Failed to update user: ${error.message}`);
      logger.error("Failed to update user:", error);
    },
  });
}

/**
 * Delete a user (soft delete)
 *
 * @returns Mutation object with mutate function
 *
 * @example
 * ```tsx
 * const deleteUser = useDeleteUser();
 *
 * deleteUser.mutate({ id: userId, deleted_by: currentUserId });
 * ```
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, deleted_by }: { id: UserId; deleted_by?: UserId }) =>
      userApi.delete(id, deleted_by),
    onSuccess: (result, { id }) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() });
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });

      toast.success("User deleted successfully");
      logger.info("User deleted:", id);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete user: ${error.message}`);
      logger.error("Failed to delete user:", error);
    },
  });
}

/**
 * Restore a soft-deleted user
 *
 * @returns Mutation object with mutate function
 *
 * @example
 * ```tsx
 * const restoreUser = useRestoreUser();
 *
 * restoreUser.mutate(userId);
 * ```
 */
export function useRestoreUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: UserId) => userApi.restore(id),
    onSuccess: (user) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() });
      queryClient.setQueryData(userKeys.detail(user.id), user);

      toast.success(`User "${user.username}" restored successfully`);
      logger.info("User restored:", user.id);
    },
    onError: (error: Error) => {
      toast.error(`Failed to restore user: ${error.message}`);
      logger.error("Failed to restore user:", error);
    },
  });
}

/**
 * Permanently delete a user (hard delete - admin only)
 *
 * @returns Mutation object with mutate function
 *
 * @example
 * ```tsx
 * const deletePermanently = useDeleteUserPermanently();
 *
 * deletePermanently.mutate(userId, {
 *   onSuccess: () => navigate('/users'),
 * });
 * ```
 */
export function useDeleteUserPermanently() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: UserId) => userApi.deletePermanently(id),
    onSuccess: (result, id) => {
      // Remove from cache completely
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() });

      toast.warning("User permanently deleted");
      logger.warn("User permanently deleted:", id);
    },
    onError: (error: Error) => {
      toast.error(`Failed to permanently delete user: ${error.message}`);
      logger.error("Failed to permanently delete user:", error);
    },
  });
}

// ============================================================================
// Authentication Hooks
// ============================================================================

/**
 * Login user and get JWT token
 *
 * @returns Mutation object with mutate function
 *
 * @example
 * ```tsx
 * const login = useLogin();
 *
 * login.mutate({
 *   username: 'john.doe',
 *   password: 'password123',
 * }, {
 *   onSuccess: (response) => {
 *     // Store token and redirect
 *     localStorage.setItem('token', response.token);
 *     navigate('/dashboard');
 *   },
 * });
 * ```
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: Login) => userApi.login(credentials),
    onSuccess: (response) => {
      // Cache the logged-in user
      queryClient.setQueryData(
        userKeys.detail(response.user.id),
        response.user,
      );

      toast.success(
        `Welcome back, ${response.user.display_name || response.user.username}!`,
      );
      logger.info("User logged in:", response.user.username);
    },
    onError: (error: Error) => {
      toast.error(`Login failed: ${error.message}`);
      logger.error("Login failed:", error);
    },
  });
}

/**
 * Change user password (requires current password)
 *
 * @returns Mutation object with mutate function
 *
 * @example
 * ```tsx
 * const changePassword = useChangePassword();
 *
 * changePassword.mutate({
 *   id: userId,
 *   data: {
 *     current_password: 'old',
 *     new_password: 'new',
 *   },
 * });
 * ```
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ id, data }: { id: UserId; data: ChangePassword }) =>
      userApi.changePassword(id, data),
    onSuccess: () => {
      toast.success("Password changed successfully");
      logger.info("Password changed");
    },
    onError: (error: Error) => {
      toast.error(`Failed to change password: ${error.message}`);
      logger.error("Failed to change password:", error);
    },
  });
}

/**
 * Reset user password (admin operation)
 *
 * @returns Mutation object with mutate function
 *
 * @example
 * ```tsx
 * const resetPassword = useResetPassword();
 *
 * resetPassword.mutate({
 *   id: userId,
 *   data: { new_password: 'temp123' },
 * });
 * ```
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, data }: { id: UserId; data: ResetPassword }) =>
      userApi.resetPassword(id, data),
    onSuccess: (result, { id }) => {
      toast.success("Password reset successfully");
      logger.warn("Password reset for user:", id);
    },
    onError: (error: Error) => {
      toast.error(`Failed to reset password: ${error.message}`);
      logger.error("Failed to reset password:", error);
    },
  });
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Prefetch user data for better UX
 *
 * @param id - User ID to prefetch
 *
 * @example
 * ```tsx
 * // Prefetch on hover
 * <Link
 *   to={`/users/${userId}`}
 *   onMouseEnter={() => prefetchUser(userId)}
 * >
 *   View User
 * </Link>
 * ```
 */
export function usePrefetchUser() {
  const queryClient = useQueryClient();

  return (id: UserId) => {
    queryClient.prefetchQuery({
      queryKey: userKeys.detail(id),
      queryFn: () => userApi.get(id),
      staleTime: 1000 * 60 * 5,
    });
  };
}

/**
 * Invalidate all user queries
 * Useful after bulk operations or external updates
 *
 * @example
 * ```tsx
 * const invalidateUsers = useInvalidateUsers();
 *
 * // After bulk import
 * invalidateUsers();
 * ```
 */
export function useInvalidateUsers() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: userKeys.all });
    logger.info("All user queries invalidated");
  };
}
