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
  Download,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useInventoryItems,
  useInventoryStatistics,
  useResetInventory,
  useClearInventory,
  useSettingValue,
} from "@/hooks";
import { MEDICINE_FORMS } from "@/lib/constants";
import {
  getStockStatus,
  getStockStatusColor,
  getStockStatusLabel,
} from "@/lib/inventory-types";
import type { InventoryItem } from "@/lib/inventory-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inventory")({
  component: InventoryComponent,
});

function InventoryComponent() {
  // Fetch data
  const { data: items = [], isLoading } = useInventoryItems();
  const { data: stats } = useInventoryStatistics();
  const resetInventory = useResetInventory();
  const clearInventory = useClearInventory();

  // Settings
  const enableDevMode = useSettingValue<boolean>("enableDevMode", false);
  const isDev = enableDevMode ?? import.meta.env.DEV;

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [formFilter, setFormFilter] = useState<string | "all" | null>(null);
  const [stockFilter, setStockFilter] = useState<
    "all" | "in_stock" | "low_stock" | "out_of_stock" | null
  >(null);
  const [prescriptionFilter, setPrescriptionFilter] = useState<
    "all" | "prescription" | "otc" | null
  >(null);

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
              <Button
                onClick={() => resetInventory.mutate()}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Database className="h-5 w-5" />
                Reset Data
              </Button>
              {items.length > 0 && (
                <Button
                  onClick={() => clearInventory.mutate()}
                  variant="outline"
                  size="lg"
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-5 w-5" />
                  Clear All
                </Button>
              )}
            </>
          )}
          <Button size="lg" className="gap-2 rounded-md">
            <Plus className="h-5 w-5" />
            Add Item
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <PageContent>
        <PageContentInner className="flex-1 flex flex-col min-h-0">
          {/* Statistics */}
          {stats && (
            <PageSection className="mb-6 border-b-2 border-dashed pb-6 shrink-0">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
                  isValue
                />
              </div>
            </PageSection>
          )}

          {/* Filters */}
          {items.length > 0 && (
            <div className="mb-6 flex flex-col gap-4 shrink-0">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, generic name, or barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

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
                  <SelectTrigger className="w-full sm:w-[180px]">
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
                  <SelectTrigger className="w-full sm:w-[180px]">
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
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="otc">OTC</SelectItem>
                  </SelectContent>
                </Select>
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

          {/* Items Grid */}
          <div className="flex-1 min-h-0">
            {filteredItems.length === 0 ? (
              <div className="h-full flex items-center justify-center border border-dashed rounded-lg">
                <div className="text-center p-12">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchQuery ||
                    (formFilter && formFilter !== "all") ||
                    (stockFilter && stockFilter !== "all") ||
                    (prescriptionFilter && prescriptionFilter !== "all")
                      ? "No items found"
                      : "No inventory items"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
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
            ) : (
              <div className="h-full overflow-y-auto pb-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
  isValue?: boolean;
}

function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  isValue,
}: StatsCardProps) {
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
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
          <Badge className={cn("shrink-0", stockColor)}>{stockLabel}</Badge>
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
