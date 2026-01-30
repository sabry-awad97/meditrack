/**
 * TanStack DB Hooks for Users
 *
 * Professional reactive hooks using TanStack DB with Tauri backend integration.
 * Provides optimistic updates, automatic cache synchronization, and real-time reactivity.
 *
 * @module hooks/use-users-db
 */

import { createCollection, eq, useLiveQuery } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { toast } from "sonner";
import { useMemo } from "react";
import { queryClient } from "@/lib/query-client";
import { createLogger } from "@/lib/logger";
import {
  userApi,
  UserResponseSchema,
  type UserResponse,
  type CreateUser,
  type UpdateUser,
  type UserId,
  type UserStatus,
  type UserStatistics,
} from "@/api/user.api";

const logger = createLogger("UserDB");

// ============================================================================
// Query Keys
// ============================================================================

export const userKeys = {
  all: ["users"] as const,
  statistics: ["users", "statistics"] as const,
} as const;

// ============================================================================
// Collection Definition
// ============================================================================

/**
 * Users collection with Tauri backend integration
 * Provides reactive queries with automatic cache management
 */
export const usersCollection = createCollection(
  queryCollectionOptions({
    queryClient,
    queryKey: userKeys.all,

    // Fetch from Tauri backend
    queryFn: async (): Promise<UserResponse[]> => {
      try {
        logger.info("Fetching users from Tauri backend");
        const result = await userApi.list();

        // Validate all users
        const validatedUsers = result.items.map((user) =>
          UserResponseSchema.parse(user),
        );

        logger.info(`Fetched ${validatedUsers.length} users`);
        return validatedUsers;
      } catch (error) {
        logger.error("Failed to fetch users:", error);
        toast.error("Failed to load users");
        throw error;
      }
    },

    getKey: (user: UserResponse) => user.id,

    // Handle INSERT operations
    onInsert: async ({ transaction }) => {
      const mutation = transaction.mutations[0];
      const newUser = mutation.modified as UserResponse & {
        _createData?: CreateUser;
      };

      try {
        logger.info("Creating user:", newUser.username);

        // If we have create data, use it; otherwise extract from user
        const createData: CreateUser = newUser._createData || {
          staff_id: newUser.staff_id,
          username: newUser.username,
          email: newUser.email,
          password: "", // This should be provided by the form
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          display_name: newUser.display_name || undefined,
          avatar_url: newUser.avatar_url || undefined,
          npi_number: newUser.npi_number || undefined,
          supervisor_id: newUser.supervisor_id || undefined,
          role_id: newUser.role_id,
          status: newUser.status,
          is_active: newUser.is_active,
        };

        // Call Tauri backend
        const result = await userApi.create(createData);

        logger.info("User created successfully:", result.id);
        toast.success(`User "${newUser.username}" created successfully`);

        // Invalidate statistics
        queryClient.invalidateQueries({ queryKey: userKeys.statistics });
      } catch (error) {
        logger.error("Failed to create user:", error);
        toast.error(
          `Failed to create user: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        throw error;
      }
    },

    // Handle UPDATE operations
    onUpdate: async ({ transaction }) => {
      const mutation = transaction.mutations[0];
      const modified = mutation.modified as UserResponse;
      const original = mutation.original as UserResponse;

      try {
        logger.info("Updating user:", modified.id);

        // Calculate what changed
        const updates: UpdateUser = {};
        if (modified.username !== original.username)
          updates.username = modified.username;
        if (modified.email !== original.email) updates.email = modified.email;
        if (modified.first_name !== original.first_name)
          updates.first_name = modified.first_name;
        if (modified.last_name !== original.last_name)
          updates.last_name = modified.last_name;
        if (modified.display_name !== original.display_name)
          updates.display_name = modified.display_name || undefined;
        if (modified.avatar_url !== original.avatar_url)
          updates.avatar_url = modified.avatar_url || undefined;
        if (modified.npi_number !== original.npi_number)
          updates.npi_number = modified.npi_number || undefined;
        if (modified.supervisor_id !== original.supervisor_id)
          updates.supervisor_id = modified.supervisor_id || undefined;
        if (modified.role_id !== original.role_id)
          updates.role_id = modified.role_id;
        if (modified.status !== original.status)
          updates.status = modified.status;
        if (modified.is_active !== original.is_active)
          updates.is_active = modified.is_active;

        // Call Tauri backend
        await userApi.update(modified.id, updates);

        logger.info("User updated successfully:", modified.id);
        toast.success(`User "${modified.username}" updated successfully`);

        // Invalidate statistics if status or active state changed
        if (updates.status || updates.is_active !== undefined) {
          queryClient.invalidateQueries({ queryKey: userKeys.statistics });
        }
      } catch (error) {
        logger.error("Failed to update user:", error);
        toast.error(
          `Failed to update user: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        throw error;
      }
    },

    // Handle DELETE operations
    onDelete: async ({ transaction }) => {
      const mutation = transaction.mutations[0];
      const original = mutation.original as UserResponse;

      try {
        logger.info("Deleting user:", original.id);

        // Call Tauri backend (soft delete)
        await userApi.delete(original.id);

        logger.info("User deleted successfully:", original.id);
        toast.success(`User "${original.username}" deleted successfully`);

        // Invalidate statistics
        queryClient.invalidateQueries({ queryKey: userKeys.statistics });
      } catch (error) {
        logger.error("Failed to delete user:", error);
        toast.error(
          `Failed to delete user: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        throw error;
      }
    },
  }),
);

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get all users with reactive updates
 *
 * @example
 * ```tsx
 * const { data: users, isLoading } = useUsers();
 * ```
 */
export function useUsers() {
  const query = useLiveQuery((q) => q.from({ user: usersCollection }));

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/**
 * Get a single user by ID
 *
 * @param id - User ID
 * @example
 * ```tsx
 * const { data: user } = useUser(userId);
 * ```
 */
export function useUser(id: UserId) {
  const query = useLiveQuery(
    (q) =>
      q
        .from({ user: usersCollection })
        .where(({ user }) => eq(user.id, id))
        .limit(1),
    [id],
  );

  return {
    data: query.data?.[0] || null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/**
 * Get users by status
 *
 * @param status - User status to filter by
 * @example
 * ```tsx
 * const { data: activeUsers } = useUsersByStatus('Active');
 * ```
 */
export function useUsersByStatus(status: UserStatus | null) {
  const query = useLiveQuery(
    (q) => {
      if (!status) {
        return q.from({ user: usersCollection });
      }
      return q
        .from({ user: usersCollection })
        .where(({ user }) => eq(user.status, status));
    },
    [status],
  );

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/**
 * Get only active users
 *
 * @example
 * ```tsx
 * const { data: activeUsers } = useActiveUsers();
 * ```
 */
export function useActiveUsers() {
  const query = useLiveQuery((q) =>
    q
      .from({ user: usersCollection })
      .where(({ user }) => eq(user.is_active, true)),
  );

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/**
 * Search users by username, email, or name
 *
 * @param searchQuery - Search term
 * @example
 * ```tsx
 * const { data: results } = useSearchUsers('john');
 * ```
 */
export function useSearchUsers(searchQuery: string) {
  const query = useLiveQuery((q) => q.from({ user: usersCollection }));

  const filteredUsers = useMemo(() => {
    if (!query.data || !searchQuery || searchQuery.length < 2) {
      return query.data || [];
    }

    const lowerQuery = searchQuery.toLowerCase();
    return query.data.filter((user) => {
      return (
        user.username.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery) ||
        user.first_name.toLowerCase().includes(lowerQuery) ||
        user.last_name.toLowerCase().includes(lowerQuery) ||
        (user.display_name &&
          user.display_name.toLowerCase().includes(lowerQuery))
      );
    });
  }, [query.data, searchQuery]);

  return {
    data: filteredUsers,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/**
 * Get user statistics (computed from collection)
 *
 * @example
 * ```tsx
 * const stats = useUserStatistics();
 * // stats: { total, active, inactive, suspended }
 * ```
 */
export function useUserStatistics() {
  const { data: users } = useUsers();

  const stats = useMemo<UserStatistics>(() => {
    if (!users) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        suspended: 0,
      };
    }

    return {
      total: users.length,
      active: users.filter((u) => u.is_active && u.status === "Active").length,
      inactive: users.filter((u) => !u.is_active || u.status === "Inactive")
        .length,
      suspended: users.filter((u) => u.status === "Suspended").length,
    };
  }, [users]);

  return stats;
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new user
 *
 * @example
 * ```tsx
 * const createUser = useCreateUser();
 *
 * createUser.mutate(userData, {
 *   onSuccess: () => navigate('/users'),
 * });
 * ```
 */
export function useCreateUser() {
  return {
    mutate: (
      data: CreateUser,
      options?: {
        onSuccess?: (user: UserResponse) => void;
        onError?: (error: Error) => void;
      },
    ) => {
      try {
        // Create optimistic user object
        const optimisticUser: UserResponse & { _createData: CreateUser } = {
          id: crypto.randomUUID(), // Temporary ID
          staff_id: data.staff_id,
          username: data.username,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          display_name: data.display_name || null,
          avatar_url: data.avatar_url || null,
          npi_number: data.npi_number || null,
          supervisor_id: data.supervisor_id || null,
          role_id: data.role_id,
          status: data.status,
          is_active: data.is_active,
          last_login_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          _createData: data, // Store create data for backend call
        };

        // Validate
        const validatedUser = UserResponseSchema.parse(optimisticUser);

        // Insert into collection (triggers onInsert)
        usersCollection.insert(validatedUser);

        options?.onSuccess?.(validatedUser);
        return validatedUser;
      } catch (error) {
        logger.error("Error creating user:", error);
        options?.onError?.(error as Error);
        throw error;
      }
    },
  };
}

/**
 * Update an existing user
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
  return {
    mutate: (
      { id, data }: { id: UserId; data: Partial<UpdateUser> },
      options?: { onSuccess?: () => void; onError?: (error: Error) => void },
    ) => {
      try {
        // Update in collection (triggers onUpdate)
        usersCollection.update(id, (draft) => {
          if (data.username !== undefined) draft.username = data.username;
          if (data.email !== undefined) draft.email = data.email;
          if (data.first_name !== undefined) draft.first_name = data.first_name;
          if (data.last_name !== undefined) draft.last_name = data.last_name;
          if (data.display_name !== undefined)
            draft.display_name = data.display_name || null;
          if (data.avatar_url !== undefined)
            draft.avatar_url = data.avatar_url || null;
          if (data.npi_number !== undefined)
            draft.npi_number = data.npi_number || null;
          if (data.supervisor_id !== undefined)
            draft.supervisor_id = data.supervisor_id || null;
          if (data.role_id !== undefined) draft.role_id = data.role_id;
          if (data.status !== undefined) draft.status = data.status;
          if (data.is_active !== undefined) draft.is_active = data.is_active;
          draft.updated_at = new Date().toISOString();
        });

        options?.onSuccess?.();
      } catch (error) {
        logger.error("Error updating user:", error);
        options?.onError?.(error as Error);
        throw error;
      }
    },
  };
}

/**
 * Update user status
 *
 * @example
 * ```tsx
 * const updateStatus = useUpdateUserStatus();
 *
 * updateStatus.mutate({ id: userId, status: 'Suspended' });
 * ```
 */
export function useUpdateUserStatus() {
  return {
    mutate: (
      { id, status }: { id: UserId; status: UserStatus },
      options?: { onSuccess?: () => void },
    ) => {
      try {
        usersCollection.update(id, (draft) => {
          draft.status = status;
          draft.updated_at = new Date().toISOString();
        });

        options?.onSuccess?.();
      } catch (error) {
        logger.error("Error updating user status:", error);
        throw error;
      }
    },
  };
}

/**
 * Toggle user active state
 *
 * @example
 * ```tsx
 * const toggleActive = useToggleUserActive();
 *
 * toggleActive.mutate(userId);
 * ```
 */
export function useToggleUserActive() {
  return {
    mutate: (id: UserId, options?: { onSuccess?: () => void }) => {
      try {
        usersCollection.update(id, (draft) => {
          draft.is_active = !draft.is_active;
          draft.updated_at = new Date().toISOString();
        });

        options?.onSuccess?.();
      } catch (error) {
        logger.error("Error toggling user active state:", error);
        throw error;
      }
    },
  };
}

/**
 * Delete a user (soft delete)
 *
 * @example
 * ```tsx
 * const deleteUser = useDeleteUser();
 *
 * deleteUser.mutate(userId, {
 *   onSuccess: () => navigate('/users'),
 * });
 * ```
 */
export function useDeleteUser() {
  return {
    mutate: (
      id: UserId,
      options?: { onSuccess?: () => void; onError?: (error: Error) => void },
    ) => {
      try {
        // Delete from collection (triggers onDelete)
        usersCollection.delete(id);
        options?.onSuccess?.();
      } catch (error) {
        logger.error("Error deleting user:", error);
        options?.onError?.(error as Error);
        throw error;
      }
    },
  };
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Refresh users from backend
 *
 * @example
 * ```tsx
 * const refreshUsers = useRefreshUsers();
 *
 * <button onClick={refreshUsers}>Refresh</button>
 * ```
 */
export function useRefreshUsers() {
  return () => {
    logger.info("Manually refreshing users");
    queryClient.invalidateQueries({ queryKey: userKeys.all });
    toast.info("Refreshing users...");
  };
}

/**
 * Get user by username (computed from collection)
 *
 * @param username - Username to find
 * @example
 * ```tsx
 * const { data: user } = useUserByUsername('john.doe');
 * ```
 */
export function useUserByUsername(username: string) {
  const { data: users, isLoading, isError } = useUsers();

  const user = useMemo(() => {
    if (!users || !username) return null;
    return users.find((u) => u.username === username) || null;
  }, [users, username]);

  return {
    data: user,
    isLoading,
    isError,
  };
}
