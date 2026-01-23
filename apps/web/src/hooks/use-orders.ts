import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import db from "@/lib/db";
import {
  OrderSchema,
  OrderFormDataSchema,
  OrderStatusSchema,
  type Order,
  type OrderFormData,
  type OrderStatus,
} from "@/lib/types";

// Hook لجلب جميع الطلبات
export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async (): Promise<Order[]> => {
      const orders = await db.orders.getAll();
      // التحقق من صحة البيانات
      return z.array(OrderSchema).parse(orders);
    },
  });
}

// Hook لجلب طلب واحد
export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async (): Promise<Order | null> => {
      const order = await db.orders.getById(id);
      if (!order) return null;
      // التحقق من صحة البيانات
      return OrderSchema.parse(order);
    },
    enabled: !!id,
  });
}

// Hook لإضافة طلب
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OrderFormData) => {
      // التحقق من صحة البيانات المدخلة
      const validatedData = OrderFormDataSchema.parse(data);

      const newOrder: Order = {
        id: crypto.randomUUID(),
        customerName: validatedData.customerName,
        phoneNumber: validatedData.phoneNumber,
        medicines: validatedData.medicines.map((m) => ({
          ...m,
          id: crypto.randomUUID(),
        })),
        status: "pending",
        notes: validatedData.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // التحقق من صحة الطلب الكامل
      const validatedOrder = OrderSchema.parse(newOrder);
      return await db.orders.create(validatedOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("تم إضافة الطلب بنجاح");
    },
    onError: (error) => {
      console.error("Error creating order:", error);
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        toast.error(`خطأ في التحقق: ${firstError.message}`);
      } else {
        toast.error("فشل في إضافة الطلب");
      }
    },
  });
}

// Hook لتحديث طلب
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: OrderFormData }) => {
      // التحقق من صحة البيانات المدخلة
      const validatedData = OrderFormDataSchema.parse(data);

      return await db.orders.update(id, {
        customerName: validatedData.customerName,
        phoneNumber: validatedData.phoneNumber,
        medicines: validatedData.medicines.map((m) => ({
          ...m,
          id: crypto.randomUUID(),
        })),
        notes: validatedData.notes,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", variables.id] });
      toast.success("تم تحديث الطلب بنجاح");
    },
    onError: (error) => {
      console.error("Error updating order:", error);
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        toast.error(`خطأ في التحقق: ${firstError.message}`);
      } else {
        toast.error("فشل في تحديث الطلب");
      }
    },
  });
}

// Hook لتغيير حالة الطلب
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      // التحقق من صحة الحالة
      const validatedStatus = OrderStatusSchema.parse(status);
      return await db.orders.update(id, { status: validatedStatus });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", variables.id] });
      toast.success("تم تغيير حالة الطلب بنجاح");
    },
    onError: (error) => {
      console.error("Error updating order status:", error);
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        toast.error(`خطأ في التحقق: ${firstError.message}`);
      } else {
        toast.error("فشل في تغيير حالة الطلب");
      }
    },
  });
}

// Hook لحذف طلب
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await db.orders.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("تم حذف الطلب بنجاح");
    },
    onError: (error) => {
      console.error("Error deleting order:", error);
      toast.error("فشل في حذف الطلب");
    },
  });
}
