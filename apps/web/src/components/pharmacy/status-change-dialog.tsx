import { useState } from "react";
import { CheckCircle2, Settings } from "lucide-react";
import { useTranslation } from "@meditrack/i18n";

import { GenericDialog } from "@/components/feedback";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrderStatusConfig } from "@/hooks";
import type { Order, OrderStatus } from "@/lib/types";

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onConfirm: (orderId: string, newStatus: OrderStatus) => void;
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  order,
  onConfirm,
}: StatusChangeDialogProps) {
  const { t } = useTranslation("orders");
  const ORDER_STATUS_CONFIG = useOrderStatusConfig();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");

  const handleConfirm = () => {
    if (order && selectedStatus) {
      onConfirm(order.id, selectedStatus);
      setSelectedStatus("");
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setSelectedStatus("");
    onOpenChange(false);
  };

  if (!order) return null;

  return (
    <GenericDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("statusDialog.title")}
      description={t("statusDialog.description", { name: order.customerName })}
      icon={Settings}
      size="full"
      fullHeight={true}
      actions={[
        {
          label: t("statusDialog.cancel"),
          onClick: handleClose,
          variant: "outline",
        },
        {
          label: t("statusDialog.confirm"),
          onClick: handleConfirm,
          disabled: !selectedStatus,
          icon: CheckCircle2,
        },
      ]}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{t("statusDialog.currentStatus")}</Label>
          <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("statusDialog.statusLabel")}
            </span>
            <span className="font-medium">
              {ORDER_STATUS_CONFIG[order.status].label}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newStatus">
            {t("statusDialog.newStatusLabel")} *
          </Label>
          <Select
            items={Object.entries(ORDER_STATUS_CONFIG).map(
              ([status, config]) => ({
                value: status,
                label: config.label,
              }),
            )}
            value={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
          >
            <SelectTrigger id="newStatus" className="text-right">
              <SelectValue
                placeholder={t("statusDialog.newStatusPlaceholder")}
              />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ORDER_STATUS_CONFIG).map(([status, config]) => (
                <SelectItem
                  key={status}
                  value={status}
                  disabled={status === order.status}
                >
                  <div className="flex items-center gap-2">
                    <span>{config.label}</span>
                    {status === order.status && (
                      <span className="text-xs text-muted-foreground">
                        {t("statusDialog.current")}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </GenericDialog>
  );
}
