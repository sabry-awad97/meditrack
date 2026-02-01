import { useTranslation, useDirection } from "@meditrack/i18n";
import { BarChart3, Calendar, TrendingUp, TrendingDown } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/feedback";
import type { InventoryItemWithStockResponse } from "@/api/inventory.api";

interface StockHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItemWithStockResponse | null;
}

export function StockHistoryDialog({
  open,
  onOpenChange,
  item,
}: StockHistoryDialogProps) {
  const { t } = useTranslation("inventory");
  const { isRTL } = useDirection();

  if (!item) return null;

  // TODO: Implement stock history API endpoint
  // For now, show empty state with coming soon message
  const stockHistory: never[] = [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-3xl h-[80vh] flex flex-col p-0 gap-0"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="border-b px-6 py-4 shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {t("actions.stockHistory")}
                </DialogTitle>
                <DialogDescription>{item.name}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 h-0">
          <div className="p-6">
            {stockHistory.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="Stock History Coming Soon"
                description="Stock adjustment history tracking will be available in a future update. This feature will show all stock changes, adjustments, and reasons."
              />
            ) : (
              <div className="space-y-4">
                {/* Timeline of stock adjustments will go here */}
                {stockHistory.map((entry: never) => (
                  <div
                    key={entry}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    {/* Stock adjustment entry UI */}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
