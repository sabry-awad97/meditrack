import { z } from "zod";

// أنواع بيانات الإعدادات
export type SettingType =
  | "text"
  | "number"
  | "boolean"
  | "select"
  | "multiselect"
  | "color";

export type SettingCategory =
  | "general" // عام
  | "orders" // الطلبات
  | "suppliers" // الموردين
  | "notifications" // الإشعارات
  | "appearance" // المظهر
  | "alerts" // التنبيهات
  | "system"; // النظام

export interface SettingOption {
  value: string;
  label: string;
}

export interface SettingDefinition {
  id: string;
  category: SettingCategory;
  key: string;
  label: string;
  description: string;
  type: SettingType;
  defaultValue: unknown;
  options?: SettingOption[]; // للـ select و multiselect
  min?: number; // للـ number
  max?: number; // للـ number
  required?: boolean;
  validation?: (value: unknown) => boolean | string;
}

export interface Setting {
  id: string;
  key: string;
  value: unknown;
  updatedAt: Date;
}

// ========== Zod Schemas للتحقق من صحة البيانات ==========

// Schema للإعدادات العامة
export const GeneralSettingsSchema = z.object({
  pharmacyName: z.string().min(1, "اسم الصيدلية مطلوب"),
  pharmacyPhone: z.string().optional(),
  pharmacyAddress: z.string().optional(),
  workingHours: z.string().optional(),
});

// Schema لإعدادات الطلبات
export const OrdersSettingsSchema = z.object({
  defaultOrderStatus: z.enum(["pending", "ordered"]),
  autoArchiveDays: z.number().int().min(0).max(365),
  requireCustomerPhone: z.boolean(),
  allowedMedicineForms: z
    .array(z.string())
    .min(1, "يجب اختيار شكل دوائي واحد على الأقل"),
  maxMedicinesPerOrder: z.number().int().min(1).max(50),
});

// Schema لإعدادات الموردين
export const SuppliersSettingsSchema = z.object({
  minSupplierRating: z.number().min(1).max(5),
  maxDeliveryDays: z.number().int().min(1).max(30),
  requireSupplierEmail: z.boolean(),
});

// Schema لإعدادات التنبيهات
export const AlertsSettingsSchema = z.object({
  enableAlerts: z.boolean(),
  oldOrderThreshold: z.number().int().min(1).max(30),
  pickupReminderDays: z.number().int().min(1).max(14),
  alertCheckInterval: z.number().int().min(5).max(120),
});

// Schema لإعدادات الإشعارات
export const NotificationsSettingsSchema = z.object({
  enableNotifications: z.boolean(),
  notificationSound: z.boolean(),
  notifyOnNewOrder: z.boolean(),
  notifyOnStatusChange: z.boolean(),
});

// Schema لإعدادات المظهر
export const AppearanceSettingsSchema = z.object({
  defaultTheme: z.enum(["light", "dark", "system"]),
  sidebarDefaultState: z.enum(["open", "collapsed"]),
  itemsPerPage: z.number().int().min(10).max(100),
});

// Schema لإعدادات النظام
export const SystemSettingsSchema = z.object({
  enableDevMode: z.boolean(),
  autoBackup: z.boolean(),
  backupIntervalDays: z.number().int().min(1).max(30),
});

// Schema الكامل لجميع الإعدادات
export const SettingsSchema = z.object({
  // General
  pharmacyName: z.string().min(1, "اسم الصيدلية مطلوب"),
  pharmacyPhone: z.string().optional(),
  pharmacyAddress: z.string().optional(),
  workingHours: z.string().optional(),

  // Orders
  defaultOrderStatus: z.enum(["pending", "ordered"]),
  autoArchiveDays: z.number().int().min(0).max(365),
  requireCustomerPhone: z.boolean(),
  allowedMedicineForms: z
    .array(z.string())
    .min(1, "يجب اختيار شكل دوائي واحد على الأقل"),
  maxMedicinesPerOrder: z.number().int().min(1).max(50),

  // Suppliers
  minSupplierRating: z.number().min(1).max(5),
  maxDeliveryDays: z.number().int().min(1).max(30),
  requireSupplierEmail: z.boolean(),

  // Alerts
  enableAlerts: z.boolean(),
  oldOrderThreshold: z.number().int().min(1).max(30),
  pickupReminderDays: z.number().int().min(1).max(14),
  alertCheckInterval: z.number().int().min(5).max(120),

  // Notifications
  enableNotifications: z.boolean(),
  notificationSound: z.boolean(),
  notifyOnNewOrder: z.boolean(),
  notifyOnStatusChange: z.boolean(),

  // Appearance
  defaultTheme: z.enum(["light", "dark", "system"]),
  sidebarDefaultState: z.enum(["open", "collapsed"]),
  itemsPerPage: z.number().int().min(10).max(100),

  // System
  enableDevMode: z.boolean(),
  autoBackup: z.boolean(),
  backupIntervalDays: z.number().int().min(1).max(30),
});

// Schema للتحديثات الجزئية (جميع الحقول اختيارية)
export const PartialSettingsSchema = SettingsSchema.partial();

// استخراج الأنواع من Schemas
export type GeneralSettings = z.infer<typeof GeneralSettingsSchema>;
export type OrdersSettings = z.infer<typeof OrdersSettingsSchema>;
export type SuppliersSettings = z.infer<typeof SuppliersSettingsSchema>;
export type AlertsSettings = z.infer<typeof AlertsSettingsSchema>;
export type NotificationsSettings = z.infer<typeof NotificationsSettingsSchema>;
export type AppearanceSettings = z.infer<typeof AppearanceSettingsSchema>;
export type SystemSettings = z.infer<typeof SystemSettingsSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type PartialSettings = z.infer<typeof PartialSettingsSchema>;

// نوع بيانات النموذج (متوافق مع الإصدار القديم)
export type SettingsFormData = Record<string, unknown>;
