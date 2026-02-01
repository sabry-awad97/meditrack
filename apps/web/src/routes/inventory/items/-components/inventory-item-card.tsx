import { useTranslation } from "@meditrack/i18n";
import {
  Archive,
  BarChart3,
  Copy,
  Edit,
  Eye,
  MoreHorizontal,
  Shield,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  getStockStatusColor,
  getStockStatusLabel,
} from "./utils";
import { cn } from "@/lib/utils";

// Type alias for convenience
type InventoryItem = InventoryItemWithStockResponse;

interface InventoryItemCardProps {
  item: InventoryItem;
  onViewDetails: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDuplicate: (item: InventoryItem) => void;
  onAdjustStock: (item: InventoryItem) => void;
  onViewStockHistory: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

export function InventoryItemCard({
  item,
  onViewDetails,
  onEdit,
  onDuplicate,
  onAdjustStock,
  onViewStockHistory,
  onDelete,
}: InventoryItemCardProps) {
  const { t } = useTranslation("inventory");
  const stockStatus = getStockStatus(item.stock_quantity, item.min_stock_level);
  const stockColor = getStockStatusColor(stockStatus);
  const stockLabel = getStockStatusLabel(stockStatus, t);

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-1">
              {item.name}
            </CardTitle>
            {item.generic_name && (
              <CardDescription className="text-xs line-clamp-1">
                {item.generic_name}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className={cn(stockColor)}>{stockLabel}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(item);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  <span>{t("actions.viewDetails")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(item);
                  }}
                >
                  <Edit className="h-4 w-4" />
                  <span>{t("actions.editItem")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(item);
                  }}
                >
                  <Copy className="h-4 w-4" />
                  <span>{t("actions.duplicate")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdjustStock(item);
                  }}
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>{t("actions.adjustStock")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewStockHistory(item);
                  }}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>{t("actions.stockHistory")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item);
                  }}
                >
                  <Archive className="h-4 w-4" />
                  <span>{t("actions.archive")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Concentration & Form */}
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className="font-normal">
            {item.concentration}
          </Badge>
          <Badge variant="outline" className="font-normal">
            {item.medicine_form_name_en || "—"}
          </Badge>
        </div>

        {/* Stock Info */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Stock:</span>
            <span className="font-medium">{item.stock_quantity} units</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Min Level:</span>
            <span className="font-medium">{item.min_stock_level} units</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium">${item.unit_price.toFixed(2)}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          {item.requires_prescription && (
            <Badge variant="secondary" className="text-xs">
              Rx Required
            </Badge>
          )}
          {item.is_controlled && (
            <Badge variant="destructive" className="text-xs gap-1">
              <Shield className="h-3 w-3" />
              Controlled
            </Badge>
          )}
          {item.manufacturer_name && (
            <Badge variant="outline" className="text-xs">
              {item.manufacturer_name}
            </Badge>
          )}
        </div>

        {/* Barcode */}
        {item.barcodes.length > 0 && (
          <div className="text-xs text-muted-foreground font-mono">
            {item.barcodes.find((b) => b.is_primary)?.barcode ||
              item.barcodes[0]?.barcode}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
