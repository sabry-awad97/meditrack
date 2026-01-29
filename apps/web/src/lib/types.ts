import { z } from "zod/v3";

// ========== Order Types ==========

// Schema لحالة الطلب
export const OrderStatusSchema = z.enum([
  "pending", // قيد الانتظار
  "ordered", // تم الطلب
  "arrived", // وصل
  "delivered", // تم التسليم
  "cancelled", // ملغي
]);

// Schema للدواء
export const MedicineSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  concentration: z.string().min(1),
  form: z.string().min(1),
  quantity: z.number().int().positive(),
});

// Schema للطلب
export const OrderSchema = z.object({
  id: z.string().uuid(),
  customerName: z.string().min(1),
  phoneNumber: z.string().min(1),
  medicines: z.array(MedicineSchema).min(1),
  status: OrderStatusSchema,
  notes: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema لبيانات نموذج الطلب (بدون id للأدوية)
export const MedicineFormDataSchema = MedicineSchema.omit({ id: true });

export const OrderFormDataSchema = z.object({
  customerName: z.string().min(1),
  phoneNumber: z.string(),
  medicines: z.array(MedicineFormDataSchema).min(1),
  notes: z.string(),
});

// ========== Supplier Types ==========

// Schema للمورد
export const SupplierSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  phone: z.string().min(1),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),

  // الأدوية المتوفرة عادة
  commonMedicines: z.array(z.string()),

  // معلومات الأداء
  avgDeliveryDays: z.number().int().positive(),
  rating: z.number().min(1).max(5),
  totalOrders: z.number().int().nonnegative(),

  // ملاحظات
  notes: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema لبيانات نموذج المورد
export const SupplierFormDataSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  commonMedicines: z.array(z.string()),
  notes: z.string(),
});

// ========== Exported Types ==========

// استخراج الأنواع من Schemas
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type Medicine = z.infer<typeof MedicineSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type MedicineFormData = z.infer<typeof MedicineFormDataSchema>;
export type OrderFormData = z.infer<typeof OrderFormDataSchema>;
export type Supplier = z.infer<typeof SupplierSchema>;
export type SupplierFormData = z.infer<typeof SupplierFormDataSchema>;
