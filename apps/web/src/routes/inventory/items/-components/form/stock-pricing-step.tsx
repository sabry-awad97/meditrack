import { motion } from "motion/react";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "@meditrack/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FormData, ValidationErrors } from "./types";

interface StockPricingStepProps {
  formData: FormData;
  errors: ValidationErrors;
  onUpdateField: (
    field: keyof FormData,
    value: FormData[keyof FormData],
  ) => void;
}

export function StockPricingStep({
  formData,
  errors,
  onUpdateField,
}: StockPricingStepProps) {
  const { t } = useTranslation("inventory");

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Stock Quantity */}
        <div className="space-y-2">
          <Label htmlFor="stock_quantity" className="flex items-center gap-2">
            {t("form.fields.currentStock")}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="stock_quantity"
            type="number"
            min="0"
            value={formData.stock_quantity}
            onChange={(e) => onUpdateField("stock_quantity", e.target.value)}
            placeholder="0"
            className={cn(errors.stock_quantity && "border-destructive")}
          />
          {errors.stock_quantity && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.stock_quantity}
            </motion.p>
          )}
        </div>

        {/* Minimum Stock Level */}
        <div className="space-y-2">
          <Label htmlFor="min_stock_level" className="flex items-center gap-2">
            {t("form.fields.minStockLevel")}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="min_stock_level"
            type="number"
            min="0"
            value={formData.min_stock_level}
            onChange={(e) => onUpdateField("min_stock_level", e.target.value)}
            placeholder="10"
            className={cn(errors.min_stock_level && "border-destructive")}
          />
          {errors.min_stock_level && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.min_stock_level}
            </motion.p>
          )}
        </div>

        {/* Unit Price */}
        <div className="space-y-2">
          <Label htmlFor="unit_price" className="flex items-center gap-2">
            {t("form.fields.unitPrice")}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="unit_price"
            type="number"
            min="0"
            step="0.01"
            value={formData.unit_price}
            onChange={(e) => onUpdateField("unit_price", e.target.value)}
            placeholder="0.00"
            className={cn(errors.unit_price && "border-destructive")}
          />
          {errors.unit_price && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.unit_price}
            </motion.p>
          )}
        </div>
      </div>

      {/* Stock Status Preview */}
      <div className="p-4 rounded-lg bg-muted/50 border">
        <h4 className="font-medium mb-3">{t("form.preview.stockStatus")}</h4>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t("form.preview.currentStock")}
            </p>
            <p className="text-2xl font-bold">{formData.stock_quantity || 0}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t("form.preview.minLevel")}
            </p>
            <p className="text-2xl font-bold">
              {formData.min_stock_level || 0}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t("form.preview.totalValue")}
            </p>
            <p className="text-2xl font-bold">
              $
              {(
                parseFloat(formData.stock_quantity || "0") *
                parseFloat(formData.unit_price || "0")
              ).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
