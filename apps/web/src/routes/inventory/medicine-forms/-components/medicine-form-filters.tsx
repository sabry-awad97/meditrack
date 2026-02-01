import { useTranslation } from "@meditrack/i18n";
import {
  SearchInput,
  FilterSelect,
  type FilterOption,
} from "@/components/forms";

interface MedicineFormFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | "active" | "inactive" | null;
  onStatusFilterChange: (value: "all" | "active" | "inactive" | null) => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
  totalItems: number;
  filteredItemsCount: number;
}

export function MedicineFormFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  activeFiltersCount,
  onClearFilters,
  totalItems,
  filteredItemsCount,
}: MedicineFormFiltersProps) {
  const { t } = useTranslation("medicine-forms");

  const statusFilterItems: FilterOption[] = [
    { value: "all", label: t("filters.allStatus") },
    { value: "active", label: t("filters.active") },
    { value: "inactive", label: t("filters.inactive") },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="flex-1 w-full sm:w-auto">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={t("filters.searchPlaceholder")}
        />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <FilterSelect
          items={statusFilterItems}
          value={statusFilter || "all"}
          onValueChange={(value) =>
            onStatusFilterChange(
              value === "all" ? null : (value as "active" | "inactive"),
            )
          }
          placeholder={t("filters.allStatus")}
        />

        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            {t("filters.clearFilters", { count: activeFiltersCount })}
          </button>
        )}

        {filteredItemsCount !== totalItems && (
          <span className="text-sm text-muted-foreground">
            {filteredItemsCount} / {totalItems}
          </span>
        )}
      </div>
    </div>
  );
}
