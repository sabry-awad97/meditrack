import { motion } from "motion/react";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "@meditrack/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { MEDICINE_FORMS } from "@/lib/constants";
import type { ManufacturerResponse } from "@/api/manufacturer.api";
import type { FormData, ValidationErrors } from "./types";

interface BasicInfoStepProps {
  formData: FormData;
  errors: ValidationErrors;
  manufacturers: ManufacturerResponse[];
  isLoadingManufacturers: boolean;
  onUpdateField: (
    field: keyof FormData,
    value: FormData[keyof FormData],
  ) => void;
}

export function BasicInfoStep({
  formData,
  errors,
  manufacturers,
  isLoadingManufacturers,
  onUpdateField,
}: BasicInfoStepProps) {
  const { t } = useTranslation("inventory");

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Medicine Name */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            {t("form.fields.medicineName")}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onUpdateField("name", e.target.value)}
            placeholder={t("form.fields.medicineNamePlaceholder")}
            className={cn(errors.name && "border-destructive")}
          />
          {errors.name && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.name}
            </motion.p>
          )}
        </div>

        {/* Generic Name */}
        <div className="space-y-2">
          <Label htmlFor="generic_name">{t("form.fields.genericName")}</Label>
          <Input
            id="generic_name"
            value={formData.generic_name}
            onChange={(e) => onUpdateField("generic_name", e.target.value)}
            placeholder={t("form.fields.genericNamePlaceholder")}
          />
        </div>

        {/* Concentration */}
        <div className="space-y-2">
          <Label htmlFor="concentration" className="flex items-center gap-2">
            {t("form.fields.concentration")}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="concentration"
            value={formData.concentration}
            onChange={(e) => onUpdateField("concentration", e.target.value)}
            placeholder={t("form.fields.concentrationPlaceholder")}
            className={cn(errors.concentration && "border-destructive")}
          />
          {errors.concentration && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.concentration}
            </motion.p>
          )}
        </div>

        {/* Form */}
        <div className="space-y-2">
          <Label htmlFor="form" className="flex items-center gap-2">
            {t("form.fields.form")}
            <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.form || ""}
            onValueChange={(value) => onUpdateField("form", value || "")}
          >
            <SelectTrigger className={cn(errors.form && "border-destructive")}>
              <SelectValue placeholder={t("form.fields.formPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {MEDICINE_FORMS.map((form) => (
                <SelectItem key={form} value={form}>
                  {form}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.form && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.form}
            </motion.p>
          )}
        </div>

        {/* Manufacturer */}
        <div className="space-y-2">
          <Label htmlFor="manufacturer_id">
            {t("form.fields.manufacturer")}
          </Label>
          <Select
            value={formData.manufacturer_id || ""}
            onValueChange={(value) =>
              onUpdateField("manufacturer_id", value || "")
            }
            disabled={isLoadingManufacturers}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isLoadingManufacturers
                    ? "Loading manufacturers..."
                    : t("form.fields.manufacturerPlaceholder")
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {t("form.fields.noManufacturer") || "None"}
              </SelectItem>
              {manufacturers.map((manufacturer) => (
                <SelectItem key={manufacturer.id} value={manufacturer.id}>
                  {manufacturer.name}
                  {manufacturer.short_name && ` (${manufacturer.short_name})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Barcode */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="barcode">{t("form.fields.barcode")}</Label>
          <Input
            id="barcode"
            value={formData.barcode}
            onChange={(e) => onUpdateField("barcode", e.target.value)}
            placeholder={t("form.fields.barcodePlaceholder")}
            className="font-mono"
          />
        </div>
      </div>
    </div>
  );
}
