import { useTranslation, useDirection } from "@meditrack/i18n";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { InventoryItemWithStockResponse } from "@/api/inventory.api";
import { cn } from "@/lib/utils";

interface InventoryDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItemWithStockResponse | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function InventoryDeleteDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
  onCancel,
}: InventoryDeleteDialogProps) {
  const { t } = useTranslation("inventory");
  const { isRTL } = useDirection();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className={cn(isRTL && "text-right")}>
            {t("messages.confirmDelete", { name: item?.name || "" })}
          </AlertDialogTitle>
          <AlertDialogDescription className={cn(isRTL && "text-right")}>
            {t("messages.deleteDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={cn(isRTL && "flex-row-reverse")}>
          <AlertDialogCancel onClick={onCancel}>
            {t("messages.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t("messages.archive")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
