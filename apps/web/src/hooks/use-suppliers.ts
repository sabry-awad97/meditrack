import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import db from "@/lib/db";
import {
  SupplierSchema,
  SupplierFormDataSchema,
  type Supplier,
  type SupplierFormData,
} from "@/lib/types";

// Hook لجلب جميع الموردين
export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async (): Promise<Supplier[]> => {
      const suppliers = await db.suppliers.getAll();
      // التحقق من صحة البيانات
      return z.array(SupplierSchema).parse(suppliers);
    },
  });
}

// Hook لجلب مورد واحد
export function useSupplier(id: string) {
  return useQuery({
    queryKey: ["suppliers", id],
    queryFn: async (): Promise<Supplier | null> => {
      const supplier = await db.suppliers.getById(id);
      if (!supplier) return null;
      // التحقق من صحة البيانات
      return SupplierSchema.parse(supplier);
    },
    enabled: !!id,
  });
}

// Hook للحصول على موردين مقترحين حسب الدواء
export function useSuggestedSuppliers(medicineName: string) {
  return useQuery({
    queryKey: ["suppliers", "suggested", medicineName],
    queryFn: async (): Promise<Supplier[]> => {
      const suppliers = await db.suppliers.findByMedicine(medicineName);
      // التحقق من صحة البيانات
      return z.array(SupplierSchema).parse(suppliers);
    },
    enabled: !!medicineName && medicineName.length > 2,
  });
}

// Hook لإضافة مورد
export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SupplierFormData) => {
      // التحقق من صحة البيانات المدخلة
      const validatedData = SupplierFormDataSchema.parse(data);

      const newSupplier: Supplier = {
        id: crypto.randomUUID(),
        ...validatedData,
        avgDeliveryDays: 3,
        rating: 3,
        totalOrders: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // التحقق من صحة المورد الكامل
      const validatedSupplier = SupplierSchema.parse(newSupplier);
      return await db.suppliers.create(validatedSupplier);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("تم إضافة المورد بنجاح");
    },
    onError: (error) => {
      console.error("Error creating supplier:", error);
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        toast.error(`خطأ في التحقق: ${firstError.message}`);
      } else {
        toast.error("فشل في إضافة المورد");
      }
    },
  });
}

// Hook لتحديث مورد
export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<SupplierFormData>;
    }) => {
      // التحقق من صحة البيانات المدخلة
      const validatedData = SupplierFormDataSchema.partial().parse(data);
      return await db.suppliers.update(id, validatedData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers", variables.id] });
      toast.success("تم تحديث المورد بنجاح");
    },
    onError: (error) => {
      console.error("Error updating supplier:", error);
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        toast.error(`خطأ في التحقق: ${firstError.message}`);
      } else {
        toast.error("فشل في تحديث المورد");
      }
    },
  });
}

// Hook لحذف مورد
export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await db.suppliers.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("تم حذف المورد بنجاح");
    },
    onError: (error) => {
      console.error("Error deleting supplier:", error);
      toast.error("فشل في حذف المورد");
    },
  });
}
