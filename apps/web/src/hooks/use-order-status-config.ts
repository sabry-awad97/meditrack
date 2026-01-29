import { useTranslation } from "@medi-order/i18n";
import type { OrderStatus } from "@/lib/types";

export function useOrderStatusConfig() {
  const { t } = useTranslation("orders");

  const ORDER_STATUS_CONFIG: Record<
    OrderStatus,
    {
      label: string;
      color: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    pending: {
      label: t("status.pending"),
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      variant: "secondary",
    },
    ordered: {
      label: t("status.ordered"),
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      variant: "default",
    },
    arrived: {
      label: t("status.arrived"),
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      variant: "outline",
    },
    delivered: {
      label: t("status.delivered"),
      color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      variant: "outline",
    },
    cancelled: {
      label: t("status.cancelled"),
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      variant: "destructive",
    },
  };

  return ORDER_STATUS_CONFIG;
}
