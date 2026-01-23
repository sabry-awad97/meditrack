import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import db from "@/lib/db";
import { generateSeedOrders, generateSeedSuppliers } from "@/lib/seed-data";

// Hook لإضافة بيانات تجريبية
export function useSeedData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // توليد البيانات
      const orders = generateSeedOrders(15);
      const suppliers = generateSeedSuppliers(8);

      // إضافة الطلبات
      for (const order of orders) {
        await db.orders.create(order);
      }

      // إضافة الموردين
      for (const supplier of suppliers) {
        await db.suppliers.create(supplier);
      }

      return { ordersCount: orders.length, suppliersCount: suppliers.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success(
        `تم إضافة ${data.ordersCount} طلب و ${data.suppliersCount} مورد بنجاح`,
      );
    },
    onError: (error) => {
      console.error("Error seeding data:", error);
      toast.error("فشل في إضافة البيانات التجريبية");
    },
  });
}

// Hook لحذف جميع البيانات
export function useClearData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const orders = await db.orders.getAll();
      const suppliers = await db.suppliers.getAll();

      // حذف جميع الطلبات
      for (const order of orders) {
        await db.orders.delete(order.id);
      }

      // حذف جميع الموردين
      for (const supplier of suppliers) {
        await db.suppliers.delete(supplier.id);
      }

      return { ordersCount: orders.length, suppliersCount: suppliers.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success(
        `تم حذف ${data.ordersCount} طلب و ${data.suppliersCount} مورد بنجاح`,
      );
    },
    onError: (error) => {
      console.error("Error clearing data:", error);
      toast.error("فشل في حذف البيانات");
    },
  });
}
