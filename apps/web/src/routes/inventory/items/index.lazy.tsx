import { useMemo, useState } from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Plus, Package, LayoutGrid } from "lucide-react";
import { useDirection, useTranslation } from "@meditrack/i18n";
import type { SortingState } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import {
  Page,
  PageHeader,
  PageHeaderTrigger,
  PageHeaderContent,
  PageHeaderTitle,
  PageHeaderDescription,
  PageHeaderActions,
  PageContent,
  PageContentInner,
} from "@/components/ui/page";
import {
  useInventoryItems,
  useInventoryStatistics,
  useCreateInventoryItem,
  useAdjustInventoryStock,
  useDeleteInventoryItem,
  usePriceHistory,
  useSettingValue,
  useUpsertSettingValue,
} from "@/hooks";
import { SETTING_INVENTORY_VIEW_MODE } from "@/lib/constants";
import type {
  InventoryItemWithStockResponse,
  CreateInventoryItemWithStock,
} from "@/api/inventory.api";
import {
  InventoryForm,
  StockAdjustmentDialog,
  ItemDetailsDialog,
  InventoryStats,
  InventoryFilters,
  InventoryTable,
  InventoryGrid,
  InventoryEmptyState,
  InventoryDeleteDialog,
  useInventoryColumns,
  getStockStatus,
} from "./-components";

export const Route = createLazyFileRoute("/inventory/items/")({
  component: InventoryComponent,
});

function InventoryComponent() {
  const { t } = useTranslation("inventory");
  const { isRTL } = useDirection();

  // Fetch data
  const { data: items = [], isLoading } = useInventoryItems();
  const { data: stats } = useInventoryStatistics();
  const createInventoryItem = useCreateInventoryItem();
  const adjustStock = useAdjustInventoryStock();
  const deleteItem = useDeleteInventoryItem();

  // View mode setting
  const viewMode = useSettingValue<"table" | "grid">(
    SETTING_INVENTORY_VIEW_MODE,
    "table",
  );
  const upsertViewMode = useUpsertSettingValue();

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [formFilter, setFormFilter] = useState<string | "all" | null>(null);
  const [stockFilter, setStockFilter] = useState<
    "all" | "in_stock" | "low_stock" | "out_of_stock" | null
  >(null);
  const [prescriptionFilter, setPrescriptionFilter] = useState<
    "all" | "prescription" | "otc" | null
  >(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<InventoryItemWithStockResponse | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStockAdjustOpen, setIsStockAdjustOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] =
    useState<InventoryItemWithStockResponse | null>(null);

  // Handlers
  const handleCreateItem = (data: CreateInventoryItemWithStock) => {
    createInventoryItem.mutate(data);
    setIsFormOpen(false);
  };

  const handleStockAdjust = (
    itemId: string,
    adjustment: number,
    reason?: string,
  ) => {
    adjustStock.mutate({
      id: itemId,
      data: { adjustment, reason },
    });
    setIsStockAdjustOpen(false);
    setSelectedItem(null);
  };

  const handleDelete = (item: InventoryItemWithStockResponse) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteItem.mutate(itemToDelete.id);
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleViewDetails = (item: InventoryItemWithStockResponse) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const handleOpenStockAdjust = (item: InventoryItemWithStockResponse) => {
    setSelectedItem(item);
    setIsStockAdjustOpen(true);
  };

  const toggleViewMode = () => {
    const newMode = viewMode === "table" ? "grid" : "table";
    upsertViewMode.mutate({
      key: SETTING_INVENTORY_VIEW_MODE,
      value: newMode,
    });
  };

  const clearFilters = () => {
    setFormFilter(null);
    setStockFilter(null);
    setPrescriptionFilter(null);
  };

  // Fetch price history for selected item
  const { data: priceHistory = [] } = usePriceHistory(
    selectedItem?.id ?? "",
    12,
    { enabled: !!selectedItem },
  );

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.generic_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.barcodes.some((b) =>
          b.barcode.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesForm =
        !formFilter || formFilter === "all" || item.form === formFilter;

      const stockStatus = getStockStatus(
        item.stock_quantity,
        item.min_stock_level,
      );
      const matchesStock =
        !stockFilter || stockFilter === "all" || stockStatus === stockFilter;

      const matchesPrescription =
        !prescriptionFilter ||
        prescriptionFilter === "all" ||
        (prescriptionFilter === "prescription" && item.requires_prescription) ||
        (prescriptionFilter === "otc" && !item.requires_prescription);

      return (
        matchesSearch && matchesForm && matchesStock && matchesPrescription
      );
    });
  }, [items, searchQuery, formFilter, stockFilter, prescriptionFilter]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (formFilter && formFilter !== "all") count++;
    if (stockFilter && stockFilter !== "all") count++;
    if (prescriptionFilter && prescriptionFilter !== "all") count++;
    return count;
  }, [formFilter, stockFilter, prescriptionFilter]);

  // Table columns
  const columns = useInventoryColumns({
    t,
    isRTL,
    onViewDetails: handleViewDetails,
    onAdjustStock: handleOpenStockAdjust,
    onDelete: handleDelete,
  });

  // Check if filters are active
  const hasActiveFilters = Boolean(
    searchQuery ||
    (formFilter && formFilter !== "all") ||
    (stockFilter && stockFilter !== "all") ||
    (prescriptionFilter && prescriptionFilter !== "all"),
  );

  // Loading state
  if (isLoading) {
    return <Loading icon={Package} message="Loading inventory..." />;
  }

  return (
    <Page>
      <PageHeader>
        <PageHeaderTrigger />
        <PageHeaderContent>
          <PageHeaderTitle>{t("page.title")}</PageHeaderTitle>
          <PageHeaderDescription>{t("page.description")}</PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions className="flex gap-2">
          <Button
            onClick={toggleViewMode}
            variant="outline"
            size="default"
            className="gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">
              {viewMode === "table" ? t("page.gridView") : t("page.tableView")}
            </span>
          </Button>

          <Button
            size="default"
            className="gap-2"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("page.addItem")}</span>
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <PageContent>
        <PageContentInner className="flex-1 flex flex-col min-h-0">
          {/* Statistics */}
          <InventoryStats stats={stats} />

          {/* Filters */}
          {items.length > 0 && (
            <InventoryFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              formFilter={formFilter}
              onFormFilterChange={setFormFilter}
              stockFilter={stockFilter}
              onStockFilterChange={setStockFilter}
              prescriptionFilter={prescriptionFilter}
              onPrescriptionFilterChange={setPrescriptionFilter}
              activeFiltersCount={activeFiltersCount}
              onClearFilters={clearFilters}
              totalItems={items.length}
              filteredItemsCount={filteredItems.length}
            />
          )}

          {/* Items Display */}
          <div className="flex-1 min-h-0">
            {filteredItems.length === 0 ? (
              <InventoryEmptyState
                hasFilters={hasActiveFilters}
                onAddItem={() => setIsFormOpen(true)}
              />
            ) : viewMode === "table" ? (
              <InventoryTable
                data={filteredItems}
                columns={columns}
                sorting={sorting}
                onSortingChange={setSorting}
              />
            ) : (
              <InventoryGrid
                items={filteredItems}
                onViewDetails={handleViewDetails}
                onAdjustStock={handleOpenStockAdjust}
                onDelete={handleDelete}
              />
            )}
          </div>
        </PageContentInner>
      </PageContent>

      {/* Dialogs */}
      <InventoryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateItem}
        mode="create"
      />

      <ItemDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        item={selectedItem}
        priceHistory={priceHistory}
      />

      <StockAdjustmentDialog
        open={isStockAdjustOpen}
        onOpenChange={setIsStockAdjustOpen}
        item={selectedItem}
        onAdjust={handleStockAdjust}
      />

      <InventoryDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        item={itemToDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Page>
  );
}
