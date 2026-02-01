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
import { FilterSelect, type FilterOption } from "@/components/forms";
import { cn } from "@/lib/utils";
import type { ManufacturerResponse } from "@/api/manufacturer.api";
import type { MedicineFormResponse } from "@/api/medicine-forms.api";
import type { FormData, ValidationErrors } from "./types";

interface BasicInfoStepProps {
  formData: FormData;
  errors: ValidationErrors;
  manufacturers: ManufacturerResponse[];
  isLoadingManufacturers: boolean;
  medicineForms: MedicineFormResponse[];
  isLoadingMedicineForms: boolean;
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
  medicineForms,
  isLoadingMedicineForms,
  onUpdateField,
}: BasicInfoStepProps) {
  const { t } = useTranslation("inventory");

  // Prepare medicine form filter options
  const medicineFormOptions: FilterOption[] = medicineForms.map((form) => ({
    value: form.id,
    label: form.name_en,
  }));

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

        {/* Medicine Form */}
        <div className="space-y-2">
          <Label htmlFor="medicine_form_id" className="flex items-center gap-2">
            {t("form.fields.form")}
            <span className="text-destructive">*</span>
          </Label>
          {isLoadingMedicineForms ? (
            <div className="h-10 rounded-md border border-input bg-muted/50 flex items-center justify-center">
              <span className="text-sm text-muted-foreground">
                Loading forms...
              </span>
            </div>
          ) : (
            <FilterSelect
              items={medicineFormOptions}
              value={formData.medicine_form_id || null}
              onValueChange={(value) =>
                onUpdateField("medicine_form_id", value || "")
              }
              placeholder={t("form.fields.formPlaceholder")}
              className={cn(errors.medicine_form_id && "border-destructive")}
            />
          )}
          {errors.medicine_form_id && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.medicine_form_id}
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
