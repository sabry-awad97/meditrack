import { XCircle, Filter } from "lucide-react";
import { useTranslation } from "@meditrack/i18n";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SearchInput,
  FilterSelect,
  type FilterOption,
} from "@/components/forms";

interface ManufacturerFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | "active" | "inactive" | null;
  onStatusFilterChange: (value: "all" | "active" | "inactive" | null) => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
  totalItems: number;
  filteredItemsCount: number;
}

export function ManufacturerFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  activeFiltersCount,
  onClearFilters,
  totalItems,
  filteredItemsCount,
}: ManufacturerFiltersProps) {
  const { t } = useTranslation("manufacturer");

  const statusFilterItems: FilterOption[] = [
    { value: null, label: t("filters.filterByStatus") },
    { value: "all", label: t("filters.allStatus") },
    { value: "active", label: t("filters.active") },
    { value: "inactive", label: t("filters.inactive") },
  ];

  const hasActiveFilters = Boolean(
    searchQuery || (statusFilter && statusFilter !== "all"),
  );

  return (
    <div className="mb-6 flex flex-col gap-4 shrink-0">
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
          {/* Status Filter */}
          <FilterSelect
            items={statusFilterItems}
            value={statusFilter}
            onValueChange={onStatusFilterChange}
            placeholder={t("filters.allStatus")}
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
              <XCircle className="h-4 w-4" />
              <span>Clear ({activeFiltersCount})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>
            Showing {filteredItemsCount} of {totalItems} manufacturers
          </span>
        </div>
      )}
    </div>
  );
}
