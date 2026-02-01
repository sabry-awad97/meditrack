import { useTranslation, useDirection } from "@meditrack/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { MedicineFormResponse } from "@/api/medicine-forms.api";
import { format } from "date-fns";

interface MedicineFormDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: MedicineFormResponse | null;
}

export function MedicineFormDetailsDialog({
  open,
  onOpenChange,
  form,
}: MedicineFormDetailsDialogProps) {
  const { t } = useTranslation("medicine-forms");
  const { isRTL } = useDirection();

  if (!form) return null;

  const textAlign = isRTL ? "text-right" : "text-left";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={textAlign}>{t("details.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className={`text-sm font-semibold mb-3 ${textAlign}`}>
              {t("details.basicInfo")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm text-muted-foreground ${textAlign}`}>
                  {t("details.code")}
                </p>
                <p className={`font-medium ${textAlign}`}>{form.code}</p>
              </div>
              <div>
                <p className={`text-sm text-muted-foreground ${textAlign}`}>
                  {t("details.displayOrder")}
                </p>
                <p className={`font-medium ${textAlign}`}>
                  {form.display_order}
                </p>
              </div>
              <div>
                <p className={`text-sm text-muted-foreground ${textAlign}`}>
                  {t("details.nameEn")}
                </p>
                <p className={`font-medium ${textAlign}`}>{form.name_en}</p>
              </div>
              <div>
                <p className={`text-sm text-muted-foreground ${textAlign}`}>
                  {t("details.nameAr")}
                </p>
                <p className={`font-medium ${textAlign}`} dir="rtl">
                  {form.name_ar}
                </p>
              </div>
              <div>
                <p className={`text-sm text-muted-foreground ${textAlign}`}>
                  {t("details.status")}
                </p>
                <Badge variant={form.is_active ? "default" : "secondary"}>
                  {form.is_active ? t("details.active") : t("details.inactive")}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div>
            <h3 className={`text-sm font-semibold mb-3 ${textAlign}`}>
              {t("details.timeline")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm text-muted-foreground ${textAlign}`}>
                  {t("details.created")}
                </p>
                <p className={`text-sm ${textAlign}`}>
                  {format(new Date(form.created_at), "PPp")}
                </p>
              </div>
              <div>
                <p className={`text-sm text-muted-foreground ${textAlign}`}>
                  {t("details.lastUpdated")}
                </p>
                <p className={`text-sm ${textAlign}`}>
                  {format(new Date(form.updated_at), "PPp")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
