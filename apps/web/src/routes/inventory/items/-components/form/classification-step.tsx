import { useTranslation } from "@meditrack/i18n";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { FormData } from "./types";

interface ClassificationStepProps {
  formData: FormData;
  onUpdateField: (
    field: keyof FormData,
    value: FormData[keyof FormData],
  ) => void;
}

export function ClassificationStep({
  formData,
  onUpdateField,
}: ClassificationStepProps) {
  const { t } = useTranslation("inventory");

  return (
    <div className="space-y-6">
      {/* Regulatory Switches */}
      <div className="space-y-4 p-4 rounded-lg bg-muted/50 border">
        <h4 className="font-medium">{t("form.review.classification")}</h4>

        <div className="flex items-center justify-between p-3 rounded-md bg-background">
          <div className="space-y-0.5">
            <Label htmlFor="requires_prescription" className="text-base">
              {t("form.fields.requiresPrescription")}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("form.fields.requiresPrescriptionDesc")}
            </p>
          </div>
          <Switch
            id="requires_prescription"
            checked={formData.requires_prescription}
            onCheckedChange={(checked) =>
              onUpdateField("requires_prescription", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-md bg-background">
          <div className="space-y-0.5">
            <Label htmlFor="is_controlled" className="text-base">
              {t("form.fields.controlledSubstance")}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("form.fields.controlledSubstanceDesc")}
            </p>
          </div>
          <Switch
            id="is_controlled"
            checked={formData.is_controlled}
            onCheckedChange={(checked) =>
              onUpdateField("is_controlled", checked)
            }
          />
        </div>
      </div>

      {/* Storage Instructions */}
      <div className="space-y-2">
        <Label htmlFor="storage_instructions">
          {t("form.fields.storageInstructions")}
        </Label>
        <Textarea
          id="storage_instructions"
          value={formData.storage_instructions}
          onChange={(e) =>
            onUpdateField("storage_instructions", e.target.value)
          }
          placeholder={t("form.fields.storageInstructionsPlaceholder")}
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">{t("form.fields.notes")}</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => onUpdateField("notes", e.target.value)}
          placeholder={t("form.fields.notesPlaceholder")}
          rows={3}
          className="resize-none"
        />
      </div>
    </div>
  );
}
