import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import db from "@/lib/db";
import {
  SETTINGS_DEFINITIONS,
  getAllDefaultValues,
} from "@/lib/settings-definitions";
import {
  SettingsSchema,
  PartialSettingsSchema,
  type Settings,
  type PartialSettings,
} from "@/lib/types-settings";

// Hook لجلب جميع الإعدادات
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<Settings> => {
      const settings = await db.settings.getAll();
      const defaults = getAllDefaultValues();

      // دمج القيم المحفوظة مع القيم الافتراضية
      const merged: Record<string, unknown> = { ...defaults };
      settings.forEach((setting) => {
        merged[setting.key] = setting.value;
      });

      // التحقق من صحة البيانات باستخدام Zod
      try {
        return SettingsSchema.parse(merged);
      } catch (error) {
        console.error("Settings validation error:", error);
        // إرجاع القيم الافتراضية في حالة فشل التحقق
        return SettingsSchema.parse(defaults);
      }
    },
  });
}

// Hook لجلب إعداد واحد
export function useSetting(key: string) {
  return useQuery({
    queryKey: ["settings", key],
    queryFn: async (): Promise<unknown> => {
      const value = await db.settings.get(key);
      if (value !== null) return value;

      // إرجاع القيمة الافتراضية إذا لم يكن محفوظاً
      const definition = SETTINGS_DEFINITIONS.find((s) => s.key === key);
      return definition?.defaultValue ?? null;
    },
    enabled: !!key,
  });
}

// Hook لتحديث إعداد واحد
export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      // التحقق من صحة القيمة حسب نوع الإعداد
      const definition = SETTINGS_DEFINITIONS.find((s) => s.key === key);
      if (definition?.validation) {
        const validationResult = definition.validation(value);
        if (validationResult !== true) {
          throw new Error(
            typeof validationResult === "string"
              ? validationResult
              : "قيمة غير صالحة",
          );
        }
      }

      return await db.settings.set(key, value);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["settings", variables.key] });
      toast.success("تم حفظ الإعداد بنجاح");
    },
    onError: (error) => {
      console.error("Error updating setting:", error);
      toast.error(
        error instanceof Error ? error.message : "فشل في حفظ الإعداد",
      );
    },
  });
}

// Hook لتحديث عدة إعدادات دفعة واحدة
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: PartialSettings) => {
      // التحقق من صحة البيانات باستخدام Zod
      const validated = PartialSettingsSchema.parse(settings);
      await db.settings.setMany(validated);
      return validated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("تم حفظ الإعدادات بنجاح");
    },
    onError: (error) => {
      console.error("Error updating settings:", error);
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        toast.error(`خطأ في التحقق: ${firstError.message}`);
      } else {
        toast.error("فشل في حفظ الإعدادات");
      }
    },
  });
}

// Hook لإعادة تعيين الإعدادات إلى القيم الافتراضية
export function useResetSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<Settings> => {
      await db.settings.clear();
      const defaults = getAllDefaultValues();
      const validated = SettingsSchema.parse(defaults);
      await db.settings.setMany(validated);
      return validated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("تم إعادة تعيين الإعدادات إلى القيم الافتراضية");
    },
    onError: (error) => {
      console.error("Error resetting settings:", error);
      toast.error("فشل في إعادة تعيين الإعدادات");
    },
  });
}

// Hook لتصدير الإعدادات
export function useExportSettings() {
  return useMutation({
    mutationFn: async () => {
      const settings = await db.settings.getAll();
      const data = JSON.stringify(settings, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pharmacy-settings-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      return settings;
    },
    onSuccess: () => {
      toast.success("تم تصدير الإعدادات بنجاح");
    },
    onError: (error) => {
      console.error("Error exporting settings:", error);
      toast.error("فشل في تصدير الإعدادات");
    },
  });
}

// Hook لاستيراد الإعدادات
export function useImportSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const text = await file.text();
      const data = JSON.parse(text);

      // التحقق من صحة البيانات
      if (!Array.isArray(data)) {
        throw new Error("صيغة الملف غير صالحة");
      }

      // تحويل المصفوفة إلى كائن
      const settingsObj: Record<string, unknown> = {};
      for (const setting of data) {
        if (setting.key && setting.value !== undefined) {
          settingsObj[setting.key] = setting.value;
        }
      }

      // التحقق من صحة البيانات باستخدام Zod
      const validated = PartialSettingsSchema.parse(settingsObj);

      // حفظ الإعدادات
      await db.settings.setMany(validated);

      return validated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("تم استيراد الإعدادات بنجاح");
    },
    onError: (error) => {
      console.error("Error importing settings:", error);
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        toast.error(`خطأ في التحقق: ${firstError.message}`);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("فشل في استيراد الإعدادات");
      }
    },
  });
}
