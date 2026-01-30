import { useEffect } from "react";
import { toast } from "sonner";
import { useOrders } from "./use-orders-db";
import { useSettings } from "./use-settings-db";
import type { Order } from "@/lib/types";

/**
 * Hook للتنبيهات التلقائية للطلبات
 * يفحص الطلبات ويعرض تنبيهات للطلبات التي تحتاج متابعة
 */
export function useOrderAlerts(enabled?: boolean) {
  const { data: orders = [] } = useOrders();
  const { data: settings } = useSettings();

  // استخدام القيم من الإعدادات أو القيم الافتراضية
  const alertsEnabled = enabled ?? settings?.enableAlerts ?? true;
  const oldOrderThreshold = settings?.oldOrderThreshold ?? 7;
  const pickupReminderDays = settings?.pickupReminderDays ?? 3;
  const alertCheckInterval = settings?.alertCheckInterval ?? 30;

  useEffect(() => {
    // إذا كانت التنبيهات معطلة، لا تفعل شيء
    if (!alertsEnabled) return;

    const checkAlerts = () => {
      const now = new Date();

      orders.forEach((order: Order) => {
        const daysSinceCreated =
          (now.getTime() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24);

        // تنبيه للطلبات القديمة (حسب الإعدادات)
        if (
          daysSinceCreated > oldOrderThreshold &&
          order.status === "pending"
        ) {
          toast.warning(
            `⚠️ طلب ${order.customerName} قديم (${Math.floor(daysSinceCreated)} أيام)`,
            {
              id: `old-order-${order.id}`,
              duration: 10000,
              description: "يحتاج متابعة مع المورد",
            },
          );
        }

        // تنبيه للطلبات الواصلة غير المستلمة (حسب الإعدادات)
        if (
          daysSinceCreated > pickupReminderDays &&
          order.status === "arrived"
        ) {
          toast.info(`� ${order.customerName} لم يستلم طلبه بعد`, {
            id: `not-picked-${order.id}`,
            duration: 10000,
            description: `مضى ${Math.floor(daysSinceCreated)} أيام على وصول الطلب`,
          });
        }

        // تنبيه للطلبات التي تم طلبها منذ فترة ولم تصل
        const delayedThreshold = oldOrderThreshold - 2; // قبل يومين من عتبة الطلبات القديمة
        if (daysSinceCreated > delayedThreshold && order.status === "ordered") {
          toast.warning(`🚚 طلب ${order.customerName} متأخر`, {
            id: `delayed-order-${order.id}`,
            duration: 10000,
            description: "تحقق من حالة الطلب مع المورد",
          });
        }
      });
    };

    // فحص فوري عند التحميل
    checkAlerts();

    // فحص حسب الفترة المحددة في الإعدادات (بالدقائق)
    const interval = setInterval(checkAlerts, alertCheckInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [
    orders,
    alertsEnabled,
    oldOrderThreshold,
    pickupReminderDays,
    alertCheckInterval,
  ]);
}

/**
 * Hook للحصول على إحصائيات التنبيهات
 */
export function useAlertStats() {
  const { data: orders = [] } = useOrders();
  const { data: settings } = useSettings();

  const oldOrderThreshold = settings?.oldOrderThreshold ?? 7;
  const pickupReminderDays = settings?.pickupReminderDays ?? 3;

  const now = new Date();

  const oldOrders = orders.filter((order: Order) => {
    const days =
      (now.getTime() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return days > oldOrderThreshold && order.status === "pending";
  }).length;

  const notPickedUp = orders.filter((order: Order) => {
    const days =
      (now.getTime() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return days > pickupReminderDays && order.status === "arrived";
  }).length;

  const delayed = orders.filter((order: Order) => {
    const days =
      (now.getTime() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const delayedThreshold = oldOrderThreshold - 2;
    return days > delayedThreshold && order.status === "ordered";
  }).length;

  return {
    data: {
      oldOrders,
      notPickedUp,
      delayed,
      totalAlerts: oldOrders + notPickedUp + delayed,
    },
  };
}
