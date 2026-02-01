import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Archive,
  TrendingUp,
  BarChart3,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { InventoryItemWithStockResponse } from "@/api/inventory.api";
import {
  getStockStatus,
  getStockStatusLabel,
  getStockStatusColor,
} from "./utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UseInventoryColumnsProps {
  t: (key: string) => string;
  isRTL: boolean;
  onViewDetails: (item: InventoryItemWithStockResponse) => void;
  onEdit: (item: InventoryItemWithStockResponse) => void;
  onAdjustStock: (item: InventoryItemWithStockResponse) => void;
  onDelete: (item: InventoryItemWithStockResponse) => void;
}

export function useInventoryColumns({
  t,
  isRTL,
  onViewDetails,
  onEdit,
  onAdjustStock,
  onDelete,
}: UseInventoryColumnsProps) {
  return useMemo<ColumnDef<InventoryItemWithStockResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("table.medicineName"),
        cell: ({ row }) => (
          <div className="min-w-[200px]">
            <div className="font-medium">{row.original.name}</div>
            {row.original.generic_name && (
              <div className="text-xs text-muted-foreground">
                {row.original.generic_name}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "concentration",
        header: t("table.concentration"),
        cell: ({ row }) => (
          <Badge variant="outline" className="font-normal">
            {row.original.concentration}
          </Badge>
        ),
      },
      {
        accessorKey: "form",
        header: t("table.form"),
        cell: ({ row }) => (
          <Badge variant="outline" className="font-normal">
            {row.original.form}
          </Badge>
        ),
      },
      {
        accessorKey: "stock_quantity",
        header: t("table.stock"),
        cell: ({ row }) => {
          const stockStatus = getStockStatus(
            row.original.stock_quantity,
            row.original.min_stock_level,
          );
          const stockColor = getStockStatusColor(stockStatus);
          const stockLabel = getStockStatusLabel(stockStatus, t);
          const percentage = Math.min(
            (row.original.stock_quantity / row.original.min_stock_level) * 100,
            100,
          );

          return (
            <div className="min-w-[150px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium whitespace-nowrap">
                  {row.original.stock_quantity} {t("table.units")}
                </span>
                <Badge className={cn("text-xs whitespace-nowrap", stockColor)}>
                  {stockLabel}
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    stockStatus === "out_of_stock"
                      ? "bg-red-500"
                      : stockStatus === "low_stock"
                        ? "bg-yellow-500"
                        : "bg-green-500",
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "unit_price",
        header: t("table.unitPrice"),
        cell: ({ row }) => (
          <span className="font-medium">
            ${row.original.unit_price.toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "manufacturer_name",
        header: t("table.manufacturer"),
        cell: ({ row }) =>
          row.original.manufacturer_name ? (
            <Badge variant="outline" className="font-normal">
              {row.original.manufacturer_name}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs">
              {t("table.na")}
            </span>
          ),
      },
      {
        id: "badges",
        header: t("table.type"),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1 min-w-[120px]">
            {row.original.requires_prescription && (
              <Badge variant="secondary" className="text-xs">
                {t("table.rx")}
              </Badge>
            )}
            {row.original.is_controlled && (
              <Badge variant="destructive" className="text-xs gap-1">
                <Shield className="h-3 w-3" />
                {t("table.controlled")}
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "barcode",
        header: t("table.barcode"),
        cell: ({ row }) => {
          const primaryBarcode =
            row.original.barcodes.find((b) => b.is_primary)?.barcode ||
            row.original.barcodes[0]?.barcode;
          return primaryBarcode ? (
            <span className="font-mono text-xs text-muted-foreground">
              {primaryBarcode}
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">
              {t("table.na")}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: t("table.actions"),
        cell: ({ row }) => {
          const item = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => onViewDetails(item)}>
                  <Eye className="h-4 w-4" />
                  <span>{t("actions.viewDetails")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Edit className="h-4 w-4" />
                  <span>{t("actions.editItem")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    toast.info(`Duplicating ${item.name}`);
                  }}
                >
                  <Copy className="h-4 w-4" />
                  <span>{t("actions.duplicate")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onAdjustStock(item)}>
                  <TrendingUp className="h-4 w-4" />
                  <span>{t("actions.adjustStock")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    toast.info(`Viewing stock history for ${item.name}`);
                  }}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>{t("actions.stockHistory")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(item)}
                >
                  <Archive className="h-4 w-4" />
                  <span>{t("actions.archive")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, isRTL, onViewDetails, onEdit, onAdjustStock, onDelete],
  );
}
