import { useQuery } from "@tanstack/react-query";
import {
  getStockHistory,
  getStockHistoryStatistics,
} from "@/api/inventory.api";

/**
 * Hook to fetch stock history for an inventory item
 */
export function useStockHistory(itemId: string, limit?: number) {
  return useQuery({
    queryKey: ["stock-history", itemId, limit],
    queryFn: () => getStockHistory(itemId, limit),
    enabled: !!itemId,
  });
}

/**
 * Hook to fetch stock history statistics for an inventory item
 */
export function useStockHistoryStatistics(itemId: string) {
  return useQuery({
    queryKey: ["stock-history-statistics", itemId],
    queryFn: () => getStockHistoryStatistics(itemId),
    enabled: !!itemId,
  });
}
