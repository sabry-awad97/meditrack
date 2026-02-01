import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ReferenceDot,
  Label,
} from "recharts";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useDirection, useTranslation, useLocale } from "@meditrack/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { TrendingUp, TrendingDown, Minus, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StockHistoryEntry } from "@/api/inventory.api";

interface StockHistoryChartProps {
  data: StockHistoryEntry[];
  currentStock: number;
  className?: string;
}

export function StockHistoryChart({
  data,
  currentStock,
  className,
}: StockHistoryChartProps) {
  const { isRTL } = useDirection();
  const { t } = useTranslation("inventory");
  const { locale } = useLocale();

  const dateLocale = locale === "ar" ? ar : undefined;

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data
      .map((entry) => ({
        date: new Date(entry.recorded_at).getTime(),
        stock: entry.quantity_after,
        formattedDate: format(new Date(entry.recorded_at), "MMM dd, yyyy", {
          locale: dateLocale,
        }),
        adjustment: entry.adjustment_amount,
        reason: entry.reason,
      }))
      .sort((a, b) => a.date - b.date);
  }, [data, dateLocale]);

  const chartConfig = {
    stock: {
      label: t("stockHistory.title"),
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  const stockStats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        trend: "stable" as const,
        change: 0,
        changePercent: 0,
        minStock: currentStock,
        maxStock: currentStock,
        avgStock: currentStock,
        minDataPoint: null,
        maxDataPoint: null,
      };
    }

    const stocks = chartData.map((d) => d.stock);
    const firstStock = stocks[0];
    const lastStock = stocks[stocks.length - 1];
    const change = lastStock - firstStock;
    const changePercent = firstStock > 0 ? (change / firstStock) * 100 : 0;

    const minStock = Math.min(...stocks);
    const maxStock = Math.max(...stocks);
    const minDataPoint = chartData.find((d) => d.stock === minStock) || null;
    const maxDataPoint = chartData.find((d) => d.stock === maxStock) || null;

    return {
      trend:
        changePercent > 5
          ? ("up" as const)
          : changePercent < -5
            ? ("down" as const)
            : ("stable" as const),
      change,
      changePercent,
      minStock,
      maxStock,
      avgStock: Math.round(stocks.reduce((a, b) => a + b, 0) / stocks.length),
      minDataPoint,
      maxDataPoint,
    };
  }, [chartData, currentStock]);

  if (chartData.length === 0) {
    return (
      <Card className={cn("border-muted/40", className)}>
        <CardHeader className="pb-3">
          <CardTitle
            className={cn(
              "flex items-center gap-2 text-base font-semibold",
              isRTL && "flex-row-reverse",
            )}
          >
            <Package className="h-4 w-4 text-primary" />
            {t("stockHistory.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex items-center justify-center h-[140px] text-sm text-muted-foreground">
            {t("stockHistory.noHistoryDescription")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-muted/40", className)}>
      <CardHeader className="pb-3">
        <div
          className={cn(
            "flex items-center justify-between gap-4",
            isRTL && "flex-row-reverse",
          )}
        >
          <CardTitle
            className={cn(
              "flex items-center gap-2 text-base font-semibold",
              isRTL && "flex-row-reverse",
            )}
          >
            <Package className="h-4 w-4 text-primary" />
            {t("stockHistory.title")}
          </CardTitle>
          <div
            className={cn(
              "flex items-center gap-1.5",
              isRTL && "flex-row-reverse",
            )}
          >
            {stockStats.trend === "up" && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-500">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">
                  +{stockStats.changePercent.toFixed(1)}%
                </span>
              </div>
            )}
            {stockStats.trend === "down" && (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-500">
                <TrendingDown className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">
                  {stockStats.changePercent.toFixed(1)}%
                </span>
              </div>
            )}
            {stockStats.trend === "stable" && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Minus className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">
                  {t("stockHistory.stable")}
                </span>
              </div>
            )}
          </div>
        </div>
        <CardDescription className="mt-2">
          {chartData.length} {t("stockHistory.stockAdjustments")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 24,
              left: 30,
              right: 30,
              bottom: 16,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="formattedDate"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              reversed={false}
              padding={{ left: 30, right: 30 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => value.toString()}
              orientation="left"
              width={55}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) => (
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-base">
                        {Number(value)} units
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Line
              dataKey="stock"
              type="natural"
              stroke="#10b981"
              strokeWidth={2}
              dot={{
                fill: "#10b981",
                r: 5,
              }}
              activeDot={{
                r: 7,
                fill: "#10b981",
              }}
            />
            {stockStats.minDataPoint && (
              <ReferenceDot
                x={stockStats.minDataPoint.formattedDate}
                y={stockStats.minDataPoint.stock}
                r={8}
                fill="#ef4444"
                stroke="#fff"
                strokeWidth={2}
              >
                <Label
                  value="Min"
                  position="bottom"
                  fill="#ef4444"
                  fontSize={11}
                  fontWeight="bold"
                  offset={8}
                />
              </ReferenceDot>
            )}
            {stockStats.maxDataPoint && (
              <ReferenceDot
                x={stockStats.maxDataPoint.formattedDate}
                y={stockStats.maxDataPoint.stock}
                r={8}
                fill="#3b82f6"
                stroke="#fff"
                strokeWidth={2}
              >
                <Label
                  value="Max"
                  position="top"
                  fill="#3b82f6"
                  fontSize={11}
                  fontWeight="bold"
                  offset={8}
                />
              </ReferenceDot>
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm pt-0">
        <div className="grid grid-cols-3 gap-4 w-full">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("stockHistory.minStock")}
            </p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              {stockStats.minStock}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("stockHistory.avgStock")}
            </p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {stockStats.avgStock}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("stockHistory.maxStock")}
            </p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {stockStats.maxStock}
            </p>
          </div>
        </div>
        {stockStats.trend !== "stable" && (
          <div
            className={cn(
              "flex gap-2 leading-none font-medium",
              isRTL && "flex-row-reverse",
            )}
          >
            {stockStats.trend === "up" ? (
              <>
                <span className="text-green-600 dark:text-green-500">
                  {t("stockHistory.trendingUpBy")}{" "}
                  {stockStats.changePercent.toFixed(1)}%
                </span>
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-500" />
              </>
            ) : (
              <>
                <span className="text-red-600 dark:text-red-500">
                  {t("stockHistory.trendingDownBy")}{" "}
                  {Math.abs(stockStats.changePercent).toFixed(1)}%
                </span>
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-500" />
              </>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
