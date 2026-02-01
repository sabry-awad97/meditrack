import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation, useDirection } from "@meditrack/i18n";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type {
  MedicineFormResponse,
  CreateMedicineForm,
  UpdateMedicineForm,
} from "@/api/medicine-forms.api";

interface MedicineFormFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: MedicineFormResponse | null;
  mode: "create" | "edit";
  onSubmit: (data: CreateMedicineForm | UpdateMedicineForm) => void;
}

export function MedicineFormFormDialog({
  open,
  onOpenChange,
  form,
  mode,
  onSubmit,
}: MedicineFormFormDialogProps) {
  const { t } = useTranslation("medicine-forms");
  const { isRTL } = useDirection();

  // Form schema
  const formSchema = z.object({
    code: z
      .string()
      .min(2, t("form.validation.codeMin"))
      .max(50, t("form.validation.codeMax")),
    name_en: z
      .string()
      .min(2, t("form.validation.nameEnMin"))
      .max(100, t("form.validation.nameEnMax")),
    name_ar: z
      .string()
      .min(2, t("form.validation.nameArMin"))
      .max(100, t("form.validation.nameArMax")),
    display_order: z.number().min(0, t("form.validation.displayOrderMin")),
    is_active: z.boolean().optional(),
  });

  type FormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name_en: "",
      name_ar: "",
      display_order: 0,
      is_active: true,
    },
  });

  const isActive = watch("is_active");

  // Reset form when dialog opens/closes or form changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && form) {
        reset({
          code: form.code,
          name_en: form.name_en,
          name_ar: form.name_ar,
          display_order: form.display_order,
          is_active: form.is_active,
        });
      } else {
        reset({
          code: "",
          name_en: "",
          name_ar: "",
          display_order: 0,
          is_active: true,
        });
      }
    }
  }, [open, mode, form, reset]);

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data);
    onOpenChange(false);
  };

  const textAlign = isRTL ? "text-right" : "text-left";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={textAlign}>
            {mode === "create" ? t("form.createTitle") : t("form.editTitle")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code" className={textAlign}>
                {t("form.code")}
              </Label>
              <Input
                id="code"
                {...register("code")}
                placeholder={t("form.codePlaceholder")}
                className={textAlign}
              />
              {errors.code?.message && (
                <p className="text-sm text-destructive">
                  {errors.code.message}
                </p>
              )}
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="display_order" className={textAlign}>
                {t("form.displayOrder")}
              </Label>
              <Input
                id="display_order"
                type="number"
                {...register("display_order", { valueAsNumber: true })}
                placeholder={t("form.displayOrderPlaceholder")}
                className={textAlign}
              />
              {errors.display_order?.message && (
                <p className="text-sm text-destructive">
                  {errors.display_order.message}
                </p>
              )}
            </div>

            {/* English Name */}
            <div className="space-y-2">
              <Label htmlFor="name_en" className={textAlign}>
                {t("form.nameEn")}
              </Label>
              <Input
                id="name_en"
                {...register("name_en")}
                placeholder={t("form.nameEnPlaceholder")}
                className={textAlign}
              />
              {errors.name_en?.message && (
                <p className="text-sm text-destructive">
                  {errors.name_en.message}
                </p>
              )}
            </div>

            {/* Arabic Name */}
            <div className="space-y-2">
              <Label htmlFor="name_ar" className={textAlign}>
                {t("form.nameAr")}
              </Label>
              <Input
                id="name_ar"
                {...register("name_ar")}
                placeholder={t("form.nameArPlaceholder")}
                dir="rtl"
              />
              {errors.name_ar?.message && (
                <p className="text-sm text-destructive">
                  {errors.name_ar.message}
                </p>
              )}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="is_active" className={textAlign}>
                {t("form.isActive")}
              </Label>
              <p className={`text-sm text-muted-foreground ${textAlign}`}>
                {t("form.isActiveDescription")}
              </p>
            </div>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue("is_active", checked)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("form.cancel")}
            </Button>
            <Button type="submit">{t("form.submit")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
