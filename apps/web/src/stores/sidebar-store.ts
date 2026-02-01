/**
 * Sidebar Store
 *
 * Centralized state management for the sidebar using Zustand.
 * Manages expanded menu items and other sidebar-related state.
 *
 * Features:
 * - Immer middleware for immutable state updates
 * - Persist middleware for localStorage persistence
 * - DevTools integration for debugging
 * - Optimized selectors to prevent unnecessary re-renders
 *
 * @module stores/sidebar-store
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";

// Enable Immer support for Map and Set
enableMapSet();

// ============================================================================
// Types
// ============================================================================

export interface SidebarState {
  // State
  expandedItems: Set<string>;

  // Actions
  toggleExpanded: (itemTitle: string) => void;
  setExpandedItems: (items: Set<string>) => void;
  expandItem: (itemTitle: string) => void;
  collapseItem: (itemTitle: string) => void;
  collapseAll: () => void;

  // Utilities
  isExpanded: (itemTitle: string) => boolean;
}

// ============================================================================
// Store
// ============================================================================

export const useSidebarStore = create<SidebarState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        expandedItems: new Set<string>(),

        // Actions
        toggleExpanded: (itemTitle: string) => {
          set((state) => {
            if (state.expandedItems.has(itemTitle)) {
              state.expandedItems.delete(itemTitle);
            } else {
              state.expandedItems.add(itemTitle);
            }
          });
        },

        setExpandedItems: (items: Set<string>) => {
          set((state) => {
            state.expandedItems = new Set(items);
          });
        },

        expandItem: (itemTitle: string) => {
          set((state) => {
            state.expandedItems.add(itemTitle);
          });
        },

        collapseItem: (itemTitle: string) => {
          set((state) => {
            state.expandedItems.delete(itemTitle);
          });
        },

        collapseAll: () => {
          set((state) => {
            state.expandedItems.clear();
          });
        },

        // Utilities
        isExpanded: (itemTitle: string) => {
          return get().expandedItems.has(itemTitle);
        },
      })),
      {
        name: "sidebar-storage",
        // Custom serialization for Set
        partialize: (state) => ({
          expandedItems: Array.from(state.expandedItems),
        }),
        // Custom deserialization for Set
        merge: (persistedState: any, currentState) => ({
          ...currentState,
          ...persistedState,
          expandedItems: new Set(persistedState?.expandedItems || []),
        }),
      },
    ),
    {
      name: "SidebarStore",
      enabled: import.meta.env.DEV,
    },
  ),
);

// ============================================================================
// Selectors (for optimized re-renders)
// ============================================================================

/**
 * Select only the expanded items
 * Use this when you need to read the expanded items
 */
export const selectExpandedItems = (state: SidebarState) => state.expandedItems;

/**
 * Select toggle function
 * Use this when you only need the toggle action
 */
export const selectToggleExpanded = (state: SidebarState) =>
  state.toggleExpanded;

/**
 * Select isExpanded function
 * Use this when you need to check if items are expanded
 */
export const selectIsExpanded = (state: SidebarState) => state.isExpanded;

/**
 * Select setExpandedItems function
 * Use this when you need to set multiple expanded items at once
 */
export const selectSetExpandedItems = (state: SidebarState) =>
  state.setExpandedItems;

/**
 * Create a selector for a specific item's expanded state
 * Use this for individual menu items to prevent unnecessary re-renders
 *
 * @example
 * const isInventoryExpanded = useSidebarStore(createIsExpandedSelector("Inventory"));
 */
export const createIsExpandedSelector =
  (itemTitle: string) => (state: SidebarState) =>
    state.expandedItems.has(itemTitle);
