import { Check, Package, DollarSign, Shield } from "lucide-react";
import { useTranslation } from "@meditrack/i18n";
import { Badge } from "@/components/ui/badge";
import type { ManufacturerResponse } from "@/api/manufacturer.api";
import type { FormData } from "./types";

interface ReviewStepProps {
  formData: FormData;
  manufacturers: ManufacturerResponse[];
}

export function ReviewStep({ formData, manufacturers }: ReviewStepProps) {
  const { t } = useTranslation("inventory");

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-linear-to-br from-primary/5 to-primary/10 border border-primary/20">
        <div className="flex items-center gap-2 mb-4">
          <Check className="h-5 w-5 text-primary" />
          <h4 className="font-semibold text-lg">{t("form.review.title")}</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("form.review.description")}
        </p>
      </div>

      {/* Basic Information */}
      <div className="space-y-3">
        <h5 className="font-medium flex items-center gap-2">
          <Package className="h-4 w-4" />
          {t("form.review.basicInfo")}
        </h5>
        <div className="grid gap-3 sm:grid-cols-2 p-4 rounded-lg bg-muted/50">
          <ReviewField
            label={t("form.fields.medicineName")}
            value={formData.name}
          />
          <ReviewField
            label={t("form.fields.genericName")}
            value={formData.generic_name || "—"}
          />
          <ReviewField
            label={t("form.fields.concentration")}
            value={formData.concentration}
          />
          <ReviewField label={t("form.fields.form")} value={formData.form} />
          <ReviewField
            label={t("form.fields.manufacturer")}
            value={
              manufacturers.find((m) => m.id === formData.manufacturer_id)
                ?.name || "—"
            }
          />
          <ReviewField
            label={t("form.fields.barcode")}
            value={formData.barcode || "—"}
          />
        </div>
      </div>

      {/* Stock & Pricing */}
      <div className="space-y-3">
        <h5 className="font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          {t("form.review.stockPricing")}
        </h5>
        <div className="grid gap-3 sm:grid-cols-3 p-4 rounded-lg bg-muted/50">
          <ReviewField
            label={t("form.preview.currentStock")}
            value={`${formData.stock_quantity} units`}
          />
          <ReviewField
            label={t("form.preview.minLevel")}
            value={`${formData.min_stock_level} units`}
          />
          <ReviewField
            label={t("form.fields.unitPrice")}
            value={`${parseFloat(formData.unit_price).toFixed(2)}`}
          />
        </div>
      </div>

      {/* Classification */}
      <div className="space-y-3">
        <h5 className="font-medium flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {t("form.review.classification")}
        </h5>
        <div className="p-4 rounded-lg bg-muted/50 space-y-3">
          <div className="flex items-center gap-2">
            {formData.requires_prescription ? (
              <Badge variant="secondary">
                {t("form.review.prescriptionRequired")}
              </Badge>
            ) : (
              <Badge variant="outline">{t("form.review.overTheCounter")}</Badge>
            )}
            {formData.is_controlled && (
              <Badge variant="destructive" className="gap-1">
                <Shield className="h-3 w-3" />
                {t("form.review.controlledSubstance")}
              </Badge>
            )}
          </div>
          {formData.storage_instructions && (
            <ReviewField
              label={t("form.fields.storageInstructions")}
              value={formData.storage_instructions}
            />
          )}
          {formData.notes && (
            <ReviewField
              label={t("form.fields.notes")}
              value={formData.notes}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Review Field Component
function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
