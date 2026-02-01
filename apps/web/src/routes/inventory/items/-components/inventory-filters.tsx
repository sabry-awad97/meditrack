import { Search, Filter, XCircle } from "lucide-react";
import { useTranslation, useDirection } from "@meditrack/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MEDICINE_FORMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface InventoryFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  formFilter: string | "all" | null;
  onFormFilterChange: (value: string | "all" | null) => void;
  stockFilter: "all" | "in_stock" | "low_stock" | "out_of_stock" | null;
  onStockFilterChange: (
    value: "all" | "in_stock" | "low_stock" | "out_of_stock" | null,
  ) => void;
  prescriptionFilter: "all" | "prescription" | "otc" | null;
  onPrescriptionFilterChange: (
    value: "all" | "prescription" | "otc" | null,
  ) => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
  totalItems: number;
  filteredItemsCount: number;
}

export function InventoryFilters({
  searchQuery,
  onSearchChange,
  formFilter,
  onFormFilterChange,
  stockFilter,
  onStockFilterChange,
  prescriptionFilter,
  onPrescriptionFilterChange,
  activeFiltersCount,
  onClearFilters,
  totalItems,
  filteredItemsCount,
}: InventoryFiltersProps) {
  const { t } = useTranslation("inventory");
  const { isRTL } = useDirection();

  const hasActiveFilters =
    searchQuery ||
    (formFilter && formFilter !== "all") ||
    (stockFilter && stockFilter !== "all") ||
    (prescriptionFilter && prescriptionFilter !== "all");

  return (
    <div className="mb-6 flex flex-col gap-4 shrink-0">
      {/* Search and Filters Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative w-full md:w-[400px]">
          <Search
            className={cn(
              "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
              isRTL ? "right-3" : "left-3",
            )}
          />
          <Input
            placeholder={t("page.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={isRTL ? "pr-10" : "pl-10"}
          />
        </div>

        {/* Desktop: Inline Filters */}
        <div className="hidden md:flex flex-row items-center gap-3 flex-1">
          {/* Form Filter */}
          <Select
            items={[
              { value: null, label: t("filters.filterByForm") },
              { value: "all", label: t("filters.allForms") },
              ...MEDICINE_FORMS.map((form) => ({
                value: form,
                label: form,
              })),
            ]}
            value={formFilter}
            onValueChange={onFormFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("filters.allForms")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.allForms")}</SelectItem>
              {MEDICINE_FORMS.map((form) => (
                <SelectItem key={form} value={form}>
                  {form}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Stock Filter */}
          <Select
            items={[
              { value: null, label: t("filters.filterByStock") },
              { value: "all", label: t("filters.allStock") },
              { value: "in_stock", label: t("filters.inStock") },
              { value: "low_stock", label: t("filters.lowStock") },
              { value: "out_of_stock", label: t("filters.outOfStock") },
            ]}
            value={stockFilter}
            onValueChange={onStockFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("filters.allStock")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.allStock")}</SelectItem>
              <SelectItem value="in_stock">{t("filters.inStock")}</SelectItem>
              <SelectItem value="low_stock">{t("filters.lowStock")}</SelectItem>
              <SelectItem value="out_of_stock">
                {t("filters.outOfStock")}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Prescription Filter */}
          <Select
            items={[
              { value: null, label: t("filters.filterByType") },
              { value: "all", label: t("filters.allTypes") },
              {
                value: "prescription",
                label: t("filters.prescription"),
              },
              { value: "otc", label: t("filters.otc") },
            ]}
            value={prescriptionFilter}
            onValueChange={onPrescriptionFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("filters.allTypes")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
              <SelectItem value="prescription">
                {t("filters.prescription")}
              </SelectItem>
              <SelectItem value="otc">{t("filters.otc")}</SelectItem>
            </SelectContent>
          </Select>

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

        {/* Mobile: Filter Sheet */}
        <Sheet>
          <SheetTrigger
            render={<Button variant="outline" className="gap-2 shrink-0" />}
            className="md:hidden"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  "h-5 w-5 rounded-full p-0 flex items-center justify-center",
                  isRTL ? "mr-1" : "ml-1",
                )}
              >
                {activeFiltersCount}
              </Badge>
            )}
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>{t("filters.filters")}</SheetTitle>
              <SheetDescription>
                Filter inventory items by form, stock status, and type
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {/* Form Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("filters.medicineForm")}
                </label>
                <Select
                  items={[
                    { value: null, label: t("filters.filterByForm") },
                    { value: "all", label: t("filters.allForms") },
                    ...MEDICINE_FORMS.map((form) => ({
                      value: form,
                      label: form,
                    })),
                  ]}
                  value={formFilter}
                  onValueChange={onFormFilterChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("filters.allForms")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("filters.allForms")}</SelectItem>
                    {MEDICINE_FORMS.map((form) => (
                      <SelectItem key={form} value={form}>
                        {form}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stock Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("filters.stockStatus")}
                </label>
                <Select
                  items={[
                    { value: null, label: t("filters.filterByStock") },
                    { value: "all", label: t("filters.allStock") },
                    { value: "in_stock", label: t("filters.inStock") },
                    {
                      value: "low_stock",
                      label: t("filters.lowStock"),
                    },
                    {
                      value: "out_of_stock",
                      label: t("filters.outOfStock"),
                    },
                  ]}
                  value={stockFilter}
                  onValueChange={onStockFilterChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("filters.allStock")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("filters.allStock")}</SelectItem>
                    <SelectItem value="in_stock">
                      {t("filters.inStock")}
                    </SelectItem>
                    <SelectItem value="low_stock">
                      {t("filters.lowStock")}
                    </SelectItem>
                    <SelectItem value="out_of_stock">
                      {t("filters.outOfStock")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prescription Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("filters.medicineType")}
                </label>
                <Select
                  items={[
                    { value: null, label: t("filters.filterByType") },
                    { value: "all", label: t("filters.allTypes") },
                    {
                      value: "prescription",
                      label: t("filters.prescription"),
                    },
                    { value: "otc", label: t("filters.otc") },
                  ]}
                  value={prescriptionFilter}
                  onValueChange={onPrescriptionFilterChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("filters.allTypes")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                    <SelectItem value="prescription">
                      {t("filters.prescription")}
                    </SelectItem>
                    <SelectItem value="otc">{t("filters.otc")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onClearFilters}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>
            Showing {filteredItemsCount} of {totalItems} items
          </span>
        </div>
      )}
    </div>
  );
}
