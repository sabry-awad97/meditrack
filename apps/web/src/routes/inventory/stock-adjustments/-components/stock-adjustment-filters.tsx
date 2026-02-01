import { X } from "lucide-react";
import { useTranslation } from "@meditrack/i18n";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SearchInput,
  FilterSelect,
  type FilterOption,
} from "@/components/forms";

interface StockAdjustmentFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  stockFilter: "all" | "in_stock" | "low_stock" | "out_of_stock" | null;
  onStockFilterChange: (
    value: "all" | "in_stock" | "low_stock" | "out_of_stock" | null,
  ) => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
  totalItems: number;
  filteredItemsCount: number;
}

export function StockAdjustmentFilters({
  searchQuery,
  onSearchChange,
  stockFilter,
  onStockFilterChange,
  activeFiltersCount,
  onClearFilters,
  totalItems,
  filteredItemsCount,
}: StockAdjustmentFiltersProps) {
  const { t } = useTranslation("stock-adjustments");

  const stockFilterItems: FilterOption[] = [
    { value: null, label: t("filters.filterByStock") },
    { value: "all", label: t("filters.allStock") },
    { value: "in_stock", label: t("filters.inStock") },
    { value: "low_stock", label: t("filters.lowStock") },
    { value: "out_of_stock", label: t("filters.outOfStock") },
  ];

  return (
    <div className="mb-6 space-y-4 shrink-0">
      {/* Search and Filters Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={t("searchPlaceholder")}
          className="w-full md:w-[400px]"
        />

        {/* Desktop: Inline Filters */}
        <div className="hidden md:flex flex-row items-center gap-3 flex-1">
          {/* Stock Status Filter */}
          <FilterSelect
            items={stockFilterItems}
            value={stockFilter}
            onValueChange={onStockFilterChange}
            placeholder={t("filters.filterByStock")}
            className="w-[180px]"
          />

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              <span>Clear ({activeFiltersCount})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      {filteredItemsCount !== totalItems && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">
            {filteredItemsCount} / {totalItems}
          </Badge>
          <span>items match your filters</span>
        </div>
      )}
    </div>
  );
}
