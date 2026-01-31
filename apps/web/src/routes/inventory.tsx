import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  XCircle,
  Shield,
  Database,
  Trash2,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Archive,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  PageSection,
} from "@/components/ui/page";
import { Loading } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  useInventoryItems,
  useInventoryStatistics,
  useResetInventory,
  useClearInventory,
  useSettingValue,
  useUpsertSettingValue,
} from "@/hooks";
import { MEDICINE_FORMS, SETTING_INVENTORY_VIEW_MODE } from "@/lib/constants";
import {
  getStockStatus,
  getStockStatusColor,
  getStockStatusLabel,
} from "@/lib/inventory-types";
import type { InventoryItem } from "@/lib/inventory-types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/inventory")({
  component: InventoryComponent,
});

// Helper function to generate pagination items with ellipsis
function generatePaginationItems(
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] {
  const items: (number | "ellipsis")[] = [];

  if (totalPages <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 0; i < totalPages; i++) {
      items.push(i);
    }
  } else {
    // Always show first page
    items.push(0);

    if (currentPage <= 3) {
      // Near the start
      for (let i = 1; i <= 4; i++) {
        items.push(i);
      }
      items.push("ellipsis");
      items.push(totalPages - 1);
    } else if (currentPage >= totalPages - 4) {
      // Near the end
      items.push("ellipsis");
      for (let i = totalPages - 5; i < totalPages - 1; i++) {
        items.push(i);
      }
      items.push(totalPages - 1);
    } else {
      // In the middle
      items.push("ellipsis");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        items.push(i);
      }
      items.push("ellipsis");
      items.push(totalPages - 1);
    }
  }

  return items;
}

function InventoryComponent() {
  // Fetch data
  const { data: items = [], isLoading } = useInventoryItems();
  const { data: stats } = useInventoryStatistics();
  const resetInventory = useResetInventory();
  const clearInventory = useClearInventory();

  // Settings
  const enableDevMode = useSettingValue<boolean>("enableDevMode", false);
  const isDev = enableDevMode ?? import.meta.env.DEV;

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

  // Toggle view mode
  const toggleViewMode = () => {
    const newMode = viewMode === "table" ? "grid" : "table";
    upsertViewMode.mutate({
      key: SETTING_INVENTORY_VIEW_MODE,
      value: newMode,
    });
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.genericName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.barcode?.toLowerCase().includes(searchQuery.toLowerCase());

      // Form filter
      const matchesForm =
        !formFilter || formFilter === "all" || item.form === formFilter;

      // Stock filter
      const stockStatus = getStockStatus(
        item.stockQuantity,
        item.minStockLevel,
      );
      const matchesStock =
        !stockFilter || stockFilter === "all" || stockStatus === stockFilter;

      // Prescription filter
      const matchesPrescription =
        !prescriptionFilter ||
        prescriptionFilter === "all" ||
        (prescriptionFilter === "prescription" && item.requiresPrescription) ||
        (prescriptionFilter === "otc" && !item.requiresPrescription);

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

  // Table columns definition
  const columns = useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Medicine Name",
        cell: ({ row }) => (
          <div className="min-w-[200px]">
            <div className="font-medium">{row.original.name}</div>
            {row.original.genericName && (
              <div className="text-xs text-muted-foreground">
                {row.original.genericName}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "concentration",
        header: "Concentration",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-normal">
            {row.original.concentration}
          </Badge>
        ),
      },
      {
        accessorKey: "form",
        header: "Form",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-normal">
            {row.original.form}
          </Badge>
        ),
      },
      {
        accessorKey: "stockQuantity",
        header: "Stock",
        cell: ({ row }) => {
          const stockStatus = getStockStatus(
            row.original.stockQuantity,
            row.original.minStockLevel,
          );
          const stockColor = getStockStatusColor(stockStatus);
          const stockLabel = getStockStatusLabel(stockStatus);
          const percentage = Math.min(
            (row.original.stockQuantity / row.original.minStockLevel) * 100,
            100,
          );

          return (
            <div className="min-w-[150px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">
                  {row.original.stockQuantity} units
                </span>
                <Badge className={cn("text-xs", stockColor)}>
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
        accessorKey: "unitPrice",
        header: "Unit Price",
        cell: ({ row }) => (
          <span className="font-medium">
            ${row.original.unitPrice.toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "manufacturer",
        header: "Manufacturer",
        cell: ({ row }) =>
          row.original.manufacturer ? (
            <Badge variant="outline" className="font-normal">
              {row.original.manufacturer}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs">N/A</span>
          ),
      },
      {
        id: "badges",
        header: "Type",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1 min-w-[120px]">
            {row.original.requiresPrescription && (
              <Badge variant="secondary" className="text-xs">
                Rx
              </Badge>
            )}
            {row.original.isControlled && (
              <Badge variant="destructive" className="text-xs gap-1">
                <Shield className="h-3 w-3" />
                Controlled
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "barcode",
        header: "Barcode",
        cell: ({ row }) =>
          row.original.barcode ? (
            <span className="font-mono text-xs text-muted-foreground">
              {row.original.barcode}
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">N/A</span>
          ),
      },
      {
        id: "actions",
        header: "Actions",
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
                <DropdownMenuItem
                  onClick={() => {
                    toast.info(`Viewing details for ${item.name}`);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    toast.info(`Editing ${item.name}`);
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Edit Item
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    toast.info(`Duplicating ${item.name}`);
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    toast.info(`Adding stock for ${item.name}`);
                  }}
                >
                  <TrendingUp className="h-4 w-4" />
                  Add Stock
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    toast.info(`Reducing stock for ${item.name}`);
                  }}
                >
                  <TrendingDown className="h-4 w-4" />
                  Reduce Stock
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    toast.info(`Viewing stock history for ${item.name}`);
                  }}
                >
                  <BarChart3 className="h-4 w-4" />
                  Stock History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    toast.info(`Archiving ${item.name}`);
                  }}
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  // Table instance
  const table = useReactTable({
    data: filteredItems,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  // Loading state
  if (isLoading) {
    return <Loading icon={Package} message="Loading inventory..." />;
  }

  return (
    <Page>
      <PageHeader>
        <PageHeaderTrigger />
        <PageHeaderContent>
          <PageHeaderTitle>Inventory Management</PageHeaderTitle>
          <PageHeaderDescription>
            Manage your pharmacy's medicine inventory
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          {isDev && (
            <>
              {/* Desktop: Show all dev buttons */}
              <Button
                onClick={() => resetInventory.mutate()}
                variant="outline"
                size="lg"
                className="gap-2 hidden lg:flex"
              >
                <Database className="h-5 w-5" />
                Reset Data
              </Button>
              {items.length > 0 && (
                <Button
                  onClick={() => clearInventory.mutate()}
                  variant="outline"
                  size="lg"
                  className="gap-2 text-destructive hover:text-destructive hidden lg:flex"
                >
                  <Trash2 className="h-5 w-5" />
                  Clear All
                </Button>
              )}

              {/* Mobile/Tablet: Dropdown menu for dev actions */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 lg:hidden"
                    >
                      <Database className="h-5 w-5" />
                      <span className="hidden sm:inline">Dev Tools</span>
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => resetInventory.mutate()}>
                    <Database className="h-4 w-4" />
                    Reset Data
                  </DropdownMenuItem>
                  {items.length > 0 && (
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => clearInventory.mutate()}
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear All
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* View toggle - responsive sizing */}
          <Button
            onClick={toggleViewMode}
            variant="outline"
            size="lg"
            className="gap-2 relative overflow-hidden group"
          >
            <div className="relative w-5 h-5">
              <LayoutGrid
                className={cn(
                  "absolute inset-0 h-5 w-5 transition-all duration-300",
                  viewMode === "table"
                    ? "opacity-100 scale-100 rotate-0"
                    : "opacity-0 scale-50 rotate-90",
                )}
              />
              <TableIcon
                className={cn(
                  "absolute inset-0 h-5 w-5 transition-all duration-300",
                  viewMode === "grid"
                    ? "opacity-100 scale-100 rotate-0"
                    : "opacity-0 scale-50 -rotate-90",
                )}
              />
            </div>
            <span className="relative hidden sm:inline">
              {viewMode === "table" ? "Grid View" : "Table View"}
            </span>
            <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Button>

          {/* Add Item - always prominent */}
          <Button size="lg" className="gap-2 rounded-md">
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Item</span>
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <PageContent>
        <PageContentInner className="flex-1 flex flex-col min-h-0">
          {/* Statistics */}
          {stats && (
            <PageSection className="mb-6 border-b-2 border-dashed pb-6 shrink-0">
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                <StatsCard
                  title="Total Items"
                  value={stats.total}
                  icon={Package}
                  color="bg-blue-500"
                />
                <StatsCard
                  title="In Stock"
                  value={stats.inStock}
                  icon={Package}
                  color="bg-green-500"
                />
                <StatsCard
                  title="Low Stock"
                  value={stats.lowStock}
                  icon={AlertTriangle}
                  color="bg-yellow-500"
                />
                <StatsCard
                  title="Out of Stock"
                  value={stats.outOfStock}
                  icon={XCircle}
                  color="bg-red-500"
                />
                <StatsCard
                  title="Total Value"
                  value={`$${stats.totalValue.toFixed(2)}`}
                  icon={Package}
                  color="bg-purple-500"
                />
              </div>
            </PageSection>
          )}

          {/* Filters */}
          {items.length > 0 && (
            <div className="mb-6 flex flex-col gap-4 shrink-0">
              {/* Search and Filter Button Row */}
              <div className="flex items-center gap-3">
                {/* Search - always visible */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, generic name, or barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Mobile: Filter Sheet */}
                <Sheet>
                  <SheetTrigger className="md:hidden">
                    <Button variant="outline" className="gap-2 shrink-0">
                      <Filter className="h-4 w-4" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                        >
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[80vh]">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>
                        Filter inventory items by form, stock status, and type
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      {/* Form Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Medicine Form
                        </label>
                        <Select
                          items={[
                            { value: null, label: "Filter by Form" },
                            { value: "all", label: "All Forms" },
                            ...MEDICINE_FORMS.map((form) => ({
                              value: form,
                              label: form,
                            })),
                          ]}
                          value={formFilter}
                          onValueChange={setFormFilter}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All Forms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Forms</SelectItem>
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
                          Stock Status
                        </label>
                        <Select
                          items={[
                            { value: null, label: "Filter by Stock" },
                            { value: "all", label: "All Stock" },
                            { value: "in_stock", label: "In Stock" },
                            { value: "low_stock", label: "Low Stock" },
                            { value: "out_of_stock", label: "Out of Stock" },
                          ]}
                          value={stockFilter}
                          onValueChange={setStockFilter}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All Stock" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Stock</SelectItem>
                            <SelectItem value="in_stock">In Stock</SelectItem>
                            <SelectItem value="low_stock">Low Stock</SelectItem>
                            <SelectItem value="out_of_stock">
                              Out of Stock
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Prescription Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Medicine Type
                        </label>
                        <Select
                          items={[
                            { value: null, label: "Filter by Type" },
                            { value: "all", label: "All Types" },
                            { value: "prescription", label: "Prescription" },
                            { value: "otc", label: "OTC" },
                          ]}
                          value={prescriptionFilter}
                          onValueChange={setPrescriptionFilter}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="prescription">
                              Prescription
                            </SelectItem>
                            <SelectItem value="otc">OTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Clear Filters Button */}
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setFormFilter(null);
                            setStockFilter(null);
                            setPrescriptionFilter(null);
                          }}
                        >
                          Clear All Filters
                        </Button>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop: Inline Filters */}
              <div className="hidden md:flex flex-row gap-4">
                {/* Form Filter */}
                <Select
                  items={[
                    { value: null, label: "Filter by Form" },
                    { value: "all", label: "All Forms" },
                    ...MEDICINE_FORMS.map((form) => ({
                      value: form,
                      label: form,
                    })),
                  ]}
                  value={formFilter}
                  onValueChange={setFormFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Forms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Forms</SelectItem>
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
                    { value: null, label: "Filter by Stock" },
                    { value: "all", label: "All Stock" },
                    { value: "in_stock", label: "In Stock" },
                    { value: "low_stock", label: "Low Stock" },
                    { value: "out_of_stock", label: "Out of Stock" },
                  ]}
                  value={stockFilter}
                  onValueChange={setStockFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Stock" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>

                {/* Prescription Filter */}
                <Select
                  items={[
                    { value: null, label: "Filter by Type" },
                    { value: "all", label: "All Types" },
                    { value: "prescription", label: "Prescription" },
                    { value: "otc", label: "OTC" },
                  ]}
                  value={prescriptionFilter}
                  onValueChange={setPrescriptionFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="otc">OTC</SelectItem>
                  </SelectContent>
                </Select>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormFilter(null);
                      setStockFilter(null);
                      setPrescriptionFilter(null);
                    }}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Clear ({activeFiltersCount})
                  </Button>
                )}
              </div>

              {/* Active Filters Summary */}
              {(searchQuery ||
                (formFilter && formFilter !== "all") ||
                (stockFilter && stockFilter !== "all") ||
                (prescriptionFilter && prescriptionFilter !== "all")) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>
                    Showing {filteredItems.length} of {items.length} items
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Items Display */}
          <div className="flex-1 min-h-0">
            {filteredItems.length === 0 ? (
              <div className="h-full flex items-center justify-center border border-dashed rounded-lg">
                <div className="text-center p-6 sm:p-12">
                  <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">
                    {searchQuery ||
                    (formFilter && formFilter !== "all") ||
                    (stockFilter && stockFilter !== "all") ||
                    (prescriptionFilter && prescriptionFilter !== "all")
                      ? "No items found"
                      : "No inventory items"}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                    {searchQuery ||
                    (formFilter && formFilter !== "all") ||
                    (stockFilter && stockFilter !== "all") ||
                    (prescriptionFilter && prescriptionFilter !== "all")
                      ? "Try adjusting your filters"
                      : "Start by adding your first inventory item"}
                  </p>
                  {!searchQuery &&
                    (!formFilter || formFilter === "all") &&
                    (!stockFilter || stockFilter === "all") &&
                    (!prescriptionFilter || prescriptionFilter === "all") && (
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Item
                      </Button>
                    )}
                </div>
              </div>
            ) : viewMode === "table" ? (
              <div
                key="table-view"
                className="h-full flex flex-col animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
              >
                <div className="flex-1 overflow-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            className="cursor-pointer"
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                          >
                            No results.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination */}
                <div className="flex flex-col gap-4 py-4 shrink-0 border-t bg-muted/20">
                  {/* Mobile: Simple pagination */}
                  <div className="flex sm:hidden items-center justify-between w-full px-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="gap-1"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm font-medium">
                      Page {table.getState().pagination.pageIndex + 1} of{" "}
                      {table.getPageCount()}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="gap-1"
                    >
                      Next
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Tablet & Desktop: Full pagination */}
                  <div className="hidden sm:flex flex-col lg:flex-row items-center justify-between gap-4 px-4">
                    {/* Items info and page size selector */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        Showing{" "}
                        <span className="font-medium text-foreground">
                          {table.getState().pagination.pageIndex *
                            table.getState().pagination.pageSize +
                            1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium text-foreground">
                          {Math.min(
                            (table.getState().pagination.pageIndex + 1) *
                              table.getState().pagination.pageSize,
                            filteredItems.length,
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                          {filteredItems.length}
                        </span>{" "}
                        items
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          Rows per page:
                        </span>
                        <Select
                          value={table
                            .getState()
                            .pagination.pageSize.toString()}
                          onValueChange={(value) => {
                            table.setPageSize(Number(value));
                          }}
                        >
                          <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[10, 20, 30, 50, 100].map((pageSize) => (
                              <SelectItem
                                key={pageSize}
                                value={pageSize.toString()}
                              >
                                {pageSize}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Page navigation */}
                    <div className="flex items-center gap-2">
                      <Pagination>
                        <PaginationContent>
                          {/* First page button */}
                          <PaginationItem className="hidden md:block">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => table.setPageIndex(0)}
                              disabled={!table.getCanPreviousPage()}
                            >
                              <ChevronsLeft className="h-4 w-4" />
                              <span className="sr-only">First page</span>
                            </Button>
                          </PaginationItem>

                          {/* Previous page button */}
                          <PaginationItem>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => table.previousPage()}
                              disabled={!table.getCanPreviousPage()}
                            >
                              <ChevronLeftIcon className="h-4 w-4" />
                              <span className="sr-only">Previous page</span>
                            </Button>
                          </PaginationItem>

                          {/* Page numbers - hidden on small tablets */}
                          <div className="hidden md:flex items-center gap-1">
                            {generatePaginationItems(
                              table.getState().pagination.pageIndex,
                              table.getPageCount(),
                            ).map((item, index) => (
                              <PaginationItem key={index}>
                                {item === "ellipsis" ? (
                                  <PaginationEllipsis />
                                ) : (
                                  <PaginationLink
                                    onClick={() =>
                                      table.setPageIndex(item as number)
                                    }
                                    isActive={
                                      table.getState().pagination.pageIndex ===
                                      item
                                    }
                                    className="h-8 w-8 cursor-pointer"
                                  >
                                    {(item as number) + 1}
                                  </PaginationLink>
                                )}
                              </PaginationItem>
                            ))}
                          </div>

                          {/* Next page button */}
                          <PaginationItem>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => table.nextPage()}
                              disabled={!table.getCanNextPage()}
                            >
                              <ChevronRightIcon className="h-4 w-4" />
                              <span className="sr-only">Next page</span>
                            </Button>
                          </PaginationItem>

                          {/* Last page button */}
                          <PaginationItem className="hidden md:block">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                table.setPageIndex(table.getPageCount() - 1)
                              }
                              disabled={!table.getCanNextPage()}
                            >
                              <ChevronsRight className="h-4 w-4" />
                              <span className="sr-only">Last page</span>
                            </Button>
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key="grid-view"
                className="h-full overflow-y-auto pb-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
              >
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 max-w-[2000px] mx-auto">
                  {filteredItems.map((item) => (
                    <InventoryItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </PageContentInner>
      </PageContent>
    </Page>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}

function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg", color, "bg-opacity-10")}>
          <Icon className={cn("h-4 w-4", color.replace("bg-", "text-"))} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

// Inventory Item Card Component
interface InventoryItemCardProps {
  item: InventoryItem;
}

function InventoryItemCard({ item }: InventoryItemCardProps) {
  const stockStatus = getStockStatus(item.stockQuantity, item.minStockLevel);
  const stockColor = getStockStatusColor(stockStatus);
  const stockLabel = getStockStatusLabel(stockStatus);

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-1">
              {item.name}
            </CardTitle>
            {item.genericName && (
              <CardDescription className="text-xs line-clamp-1">
                {item.genericName}
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
                    toast.info(`Viewing details for ${item.name}`);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info(`Editing ${item.name}`);
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Edit Item
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info(`Duplicating ${item.name}`);
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info(`Adding stock for ${item.name}`);
                  }}
                >
                  <TrendingUp className="h-4 w-4" />
                  Add Stock
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info(`Reducing stock for ${item.name}`);
                  }}
                >
                  <TrendingDown className="h-4 w-4" />
                  Reduce Stock
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info(`Viewing stock history for ${item.name}`);
                  }}
                >
                  <BarChart3 className="h-4 w-4" />
                  Stock History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info(`Archiving ${item.name}`);
                  }}
                >
                  <Archive className="h-4 w-4" />
                  Archive
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
            {item.form}
          </Badge>
        </div>

        {/* Stock Info */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Stock:</span>
            <span className="font-medium">{item.stockQuantity} units</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Min Level:</span>
            <span className="font-medium">{item.minStockLevel} units</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium">${item.unitPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          {item.requiresPrescription && (
            <Badge variant="secondary" className="text-xs">
              Rx Required
            </Badge>
          )}
          {item.isControlled && (
            <Badge variant="destructive" className="text-xs gap-1">
              <Shield className="h-3 w-3" />
              Controlled
            </Badge>
          )}
          {item.manufacturer && (
            <Badge variant="outline" className="text-xs">
              {item.manufacturer}
            </Badge>
          )}
        </div>

        {/* Barcode */}
        {item.barcode && (
          <div className="text-xs text-muted-foreground font-mono">
            {item.barcode}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
