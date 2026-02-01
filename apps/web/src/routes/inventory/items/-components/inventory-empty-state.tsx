import { Plus, Package } from "lucide-react";
import { useTranslation } from "@meditrack/i18n";
import { Button } from "@/components/ui/button";

interface InventoryEmptyStateProps {
  hasFilters: boolean;
  onAddItem: () => void;
}

export function InventoryEmptyState({
  hasFilters,
  onAddItem,
}: InventoryEmptyStateProps) {
  const { t } = useTranslation("inventory");

  return (
    <div className="h-full flex items-center justify-center border border-dashed rounded-lg">
      <div className="text-center p-6 sm:p-12">
        <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg sm:text-xl font-semibold mb-2">
          {hasFilters ? t("page.noItemsFound") : t("page.noItems")}
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
          {hasFilters ? t("page.tryDifferentSearch") : t("page.startAdding")}
        </p>
        {!hasFilters && (
          <Button className="gap-2" onClick={onAddItem}>
            <Plus className="h-4 w-4" />
            <span>{t("page.addItem")}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
