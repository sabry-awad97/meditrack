import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Phone, Calendar, Package } from "lucide-react";
import { useTranslation } from "@meditrack/i18n";

import { GenericDialog } from "@/components/feedback";
import { Separator } from "@/components/ui/separator";
import type { Order } from "@/lib/types";

import { StatusBadge } from "./status-badge";

interface OrderViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

export function OrderViewDialog({
  open,
  onOpenChange,
  order,
}: OrderViewDialogProps) {
  const { t } = useTranslation("orders");

  if (!order) return null;

  return (
    <GenericDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("viewDialog.title")}
      description={t("viewDialog.description")}
      icon={Package}
      size="full"
      fullHeight={true}
      actions={[
        {
          label: t("viewDialog.close") || "Close",
          onClick: () => onOpenChange(false),
          variant: "outline",
        },
      ]}
    >
      <div className="space-y-6">
        {/* معلومات العميل */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t("viewDialog.customerInfo")}
          </h3>
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("viewDialog.name")}
              </span>
              <span className="font-medium">{order.customerName}</span>
            </div>
            {order.phoneNumber && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("viewDialog.phone")}
                </span>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span dir="ltr" className="font-medium">
                    {order.phoneNumber}
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("viewDialog.status")}
              </span>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("viewDialog.createdDate")}
              </span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">
                  {format(order.createdAt, "d MMMM yyyy - h:mm a", {
                    locale: ar,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* الأدوية */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">
            {t("viewDialog.requestedMedicines")}
          </h3>
          <div className="space-y-2">
            {order.medicines.map((medicine, index) => (
              <div
                key={medicine.id}
                className="p-4 rounded-lg border bg-card space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <h4 className="font-semibold text-lg">{medicine.name}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>
                        {t("viewDialog.concentration")}{" "}
                        {medicine.concentration || t("viewDialog.notSpecified")}
                      </span>
                      <span>•</span>
                      <span>
                        {t("viewDialog.form")} {medicine.form}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ×{medicine.quantity}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("viewDialog.quantity")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* الملاحظات */}
        {order.notes && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">
                {t("viewDialog.pharmacistNotes")}
              </h3>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-foreground whitespace-pre-wrap">
                  {order.notes}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </GenericDialog>
  );
}
