import type { InventoryItemWithStockResponse } from "@/api/inventory.api";
import { InventoryItemCard } from "./inventory-item-card";

interface InventoryGridProps {
  items: InventoryItemWithStockResponse[];
  onViewDetails: (item: InventoryItemWithStockResponse) => void;
  onEdit: (item: InventoryItemWithStockResponse) => void;
  onDuplicate: (item: InventoryItemWithStockResponse) => void;
  onAdjustStock: (item: InventoryItemWithStockResponse) => void;
  onViewStockHistory: (item: InventoryItemWithStockResponse) => void;
  onDelete: (item: InventoryItemWithStockResponse) => void;
}

export function InventoryGrid({
  items,
  onViewDetails,
  onEdit,
  onDuplicate,
  onAdjustStock,
  onViewStockHistory,
  onDelete,
}: InventoryGridProps) {
  return (
    <div className="h-full overflow-y-auto pb-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 max-w-[2000px] mx-auto">
        {items.map((item) => (
          <InventoryItemCard
            key={item.id}
            item={item}
            onViewDetails={onViewDetails}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onAdjustStock={onAdjustStock}
            onViewStockHistory={onViewStockHistory}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
