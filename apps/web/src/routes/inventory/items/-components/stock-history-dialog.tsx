import { useTranslation, useDirection, useLocale } from "@meditrack/i18n";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/feedback";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import type { InventoryItemWithStockResponse } from "@/api/inventory.api";
import { useStockHistory, useStockHistoryStatistics } from "@/hooks";
import { StockHistoryChart } from "./stock-history-chart";

interface StockHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItemWithStockResponse | null;
}

const adjustmentTypeLabels: Record<string, string> = {
  manual_adjustment: "stockHistory.adjustmentTypes.manual_adjustment",
  order_arrival: "stockHistory.adjustmentTypes.order_arrival",
  sale: "stockHistory.adjustmentTypes.sale",
  damage: "stockHistory.adjustmentTypes.damage",
  expiry: "stockHistory.adjustmentTypes.expiry",
  return: "stockHistory.adjustmentTypes.return",
  transfer: "stockHistory.adjustmentTypes.transfer",
  initial_stock: "stockHistory.adjustmentTypes.initial_stock",
};

const adjustmentTypeColors: Record<string, string> = {
  manual_adjustment: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  order_arrival: "bg-green-500/10 text-green-700 dark:text-green-400",
  sale: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  damage: "bg-red-500/10 text-red-700 dark:text-red-400",
  expiry: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  return: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  transfer: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  initial_stock: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
};

export function StockHistoryDialog({
  open,
  onOpenChange,
  item,
}: StockHistoryDialogProps) {
  const { t } = useTranslation("inventory");
  const { isRTL } = useDirection();
  const { locale } = useLocale();

  const dateLocale = locale === "ar" ? ar : undefined;

  const { data: stockHistory = [], isLoading: isLoadingHistory } =
    useStockHistory(item?.id || "", 50, { enabled: !!item });

  const { data: statistics, isLoading: isLoadingStats } =
    useStockHistoryStatistics(item?.id || "", { enabled: !!item });

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-3xl h-[85vh] flex flex-col p-0 gap-0"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="border-b px-6 py-4 shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg">
                  {t("stockHistory.title")}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {item.name}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 h-0">
          <div className="p-6 space-y-6">
            {isLoadingHistory || isLoadingStats ? (
              <div className="space-y-4">
                <Skeleton className="h-[200px]" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
                <Skeleton className="h-32" />
              </div>
            ) : stockHistory.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title={t("stockHistory.noHistory")}
                description={t("stockHistory.noHistoryDescription")}
              />
            ) : (
              <>
                {/* Stock History Chart */}
                <StockHistoryChart
                  data={stockHistory}
                  currentStock={item.stock_quantity}
                />

                {/* Statistics Summary */}
                {statistics && statistics.total_adjustments > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card>
                      <CardContent className="p-3">
                        <div className="text-xs text-muted-foreground">
                          {t("stockHistory.statistics.totalAdjustments")}
                        </div>
                        <div className="text-xl font-bold mt-1">
                          {statistics.total_adjustments}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-500/5">
                      <CardContent className="p-3">
                        <div className="text-xs text-muted-foreground">
                          {t("stockHistory.statistics.totalAdded")}
                        </div>
                        <div className="text-xl font-bold text-green-600 mt-1">
                          +{statistics.total_added}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-red-500/5">
                      <CardContent className="p-3">
                        <div className="text-xs text-muted-foreground">
                          {t("stockHistory.statistics.totalRemoved")}
                        </div>
                        <div className="text-xl font-bold text-red-600 mt-1">
                          -{statistics.total_removed}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3">
                        <div className="text-xs text-muted-foreground">
                          {t("stockHistory.statistics.netChange")}
                        </div>
                        <div
                          className={`text-xl font-bold mt-1 ${statistics.net_change >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {statistics.net_change >= 0 ? "+" : ""}
                          {statistics.net_change}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Recent Adjustments List */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">
                    {t("stockHistory.recentAdjustments")}
                  </h3>
                  <div className="space-y-2">
                    {stockHistory.slice(0, 5).map((entry) => {
                      const isPositive = entry.adjustment_amount > 0;
                      const Icon = isPositive ? TrendingUp : TrendingDown;
                      const adjustmentColor = isPositive
                        ? "text-green-600"
                        : "text-red-600";

                      return (
                        <Card key={entry.id}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div
                                  className={`p-1.5 rounded-lg ${isPositive ? "bg-green-500/10" : "bg-red-500/10"}`}
                                >
                                  <Icon
                                    className={`h-4 w-4 ${adjustmentColor}`}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge
                                      variant="outline"
                                      className={
                                        adjustmentTypeColors[
                                          entry.adjustment_type
                                        ] || "bg-gray-500/10"
                                      }
                                    >
                                      {t(
                                        adjustmentTypeLabels[
                                          entry.adjustment_type
                                        ] || entry.adjustment_type,
                                      )}
                                    </Badge>
                                    <span
                                      className={`text-sm font-semibold ${adjustmentColor}`}
                                    >
                                      {isPositive ? "+" : ""}
                                      {entry.adjustment_amount}{" "}
                                      {t("stockHistory.units")}
                                    </span>
                                  </div>
                                  {entry.reason && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                      {entry.reason}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                    <span>
                                      {entry.quantity_before} →{" "}
                                      {entry.quantity_after}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-xs text-muted-foreground">
                                  {format(
                                    new Date(entry.recorded_at),
                                    "MMM d",
                                    {
                                      locale: dateLocale,
                                    },
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(
                                    new Date(entry.recorded_at),
                                    "h:mm a",
                                    { locale: dateLocale },
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
