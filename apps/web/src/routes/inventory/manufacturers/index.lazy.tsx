import { useMemo, useState } from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Plus, Users, Building2, MapPin, Globe } from "lucide-react";
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
  useManufacturers,
  useCreateManufacturer,
  useUpdateManufacturer,
  useDeleteManufacturer,
} from "@/hooks";
import type {
  ManufacturerResponse,
  CreateManufacturer,
  UpdateManufacturer,
} from "@/api/manufacturer.api";
import { useManufacturerColumns } from "./-components/manufacturer-table-columns";

// Generic components
import { DataTable } from "@/components/data-display";
import { EmptyState } from "@/components/feedback";
import { ConfirmationDialog } from "@/components/feedback";
import { StatsGrid, type StatItem } from "@/components/data-display";

export const Route = createLazyFileRoute("/inventory/manufacturers/")({
  component: ManufacturersComponent,
});

function ManufacturersComponent() {
  const { t } = useTranslation("common");
  const { isRTL } = useDirection();

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] =
    useState<ManufacturerResponse | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [manufacturerToDelete, setManufacturerToDelete] =
    useState<ManufacturerResponse | null>(null);

  // Build filters
  const filters = useMemo(() => {
    const filterObj: any = {};

    if (searchQuery) {
      filterObj.name = searchQuery;
    }

    if (statusFilter !== "all") {
      filterObj.is_active = statusFilter === "active";
    }

    return Object.keys(filterObj).length > 0 ? filterObj : undefined;
  }, [searchQuery, statusFilter]);

  // Fetch data with pagination
  const { data, isLoading } = useManufacturers(filters, {
    page: currentPage,
    page_size: pageSize,
  });

  const manufacturers = data?.items || [];
  const totalItems = data?.total || 0;
  const totalPages = data?.total_pages || 1;

  const createManufacturer = useCreateManufacturer();
  const updateManufacturer = useUpdateManufacturer();
  const deleteManufacturer = useDeleteManufacturer();

  // Handlers
  const handleViewDetails = (manufacturer: ManufacturerResponse) => {
    setSelectedManufacturer(manufacturer);
    // TODO: Open details dialog
  };

  const handleEdit = (manufacturer: ManufacturerResponse) => {
    setSelectedManufacturer(manufacturer);
    setIsFormOpen(true);
  };

  const handleDelete = (manufacturer: ManufacturerResponse) => {
    setManufacturerToDelete(manufacturer);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (manufacturerToDelete) {
      deleteManufacturer.mutate(manufacturerToDelete.id);
      setIsDeleteDialogOpen(false);
      setManufacturerToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setManufacturerToDelete(null);
  };

  // Calculate stats from all manufacturers (not filtered)
  const { data: allManufacturersData } = useManufacturers();
  const allManufacturers = allManufacturersData?.items || [];

  const statsItems: StatItem[] = useMemo(() => {
    const activeCount = allManufacturers.filter((m) => m.is_active).length;
    const inactiveCount = allManufacturers.length - activeCount;
    const withWebsite = allManufacturers.filter((m) => m.website).length;
    const withContact = allManufacturers.filter(
      (m) => m.email || m.phone,
    ).length;

    return [
      {
        title: "Total Manufacturers",
        value: allManufacturers.length,
        icon: Building2,
        color: "bg-blue-500",
      },
      {
        title: "Active",
        value: activeCount,
        icon: Users,
        color: "bg-green-500",
      },
      {
        title: "Inactive",
        value: inactiveCount,
        icon: Users,
        color: "bg-gray-500",
      },
      {
        title: "With Website",
        value: withWebsite,
        icon: Globe,
        color: "bg-purple-500",
      },
      {
        title: "With Contact",
        value: withContact,
        icon: MapPin,
        color: "bg-orange-500",
      },
    ];
  }, [allManufacturers]);

  // Table columns
  const columns = useManufacturerColumns({
    t,
    isRTL,
    onViewDetails: handleViewDetails,
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  // Loading state
  if (isLoading) {
    return <Loading icon={Building2} message="Loading manufacturers..." />;
  }

  return (
    <Page>
      <PageHeader>
        <PageHeaderTrigger />
        <PageHeaderContent>
          <PageHeaderTitle>Manufacturers</PageHeaderTitle>
          <PageHeaderDescription>
            Manage pharmaceutical manufacturers and suppliers
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions className="flex gap-2">
          <Button
            size="default"
            className="gap-2"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Manufacturer</span>
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <PageContent>
        <PageContentInner className="flex-1 flex flex-col min-h-0">
          {/* Statistics */}
          {statsItems.length > 0 && (
            <StatsGrid
              stats={statsItems}
              columns={{ default: 2, md: 3, lg: 5 }}
            />
          )}

          {/* Items Display */}
          <div className="flex-1 min-h-0">
            {manufacturers.length === 0 && !isLoading ? (
              <EmptyState
                icon={Building2}
                title={
                  searchQuery || statusFilter !== "all"
                    ? "No manufacturers found"
                    : "No manufacturers yet"
                }
                description={
                  searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first manufacturer"
                }
                action={
                  !searchQuery && statusFilter === "all"
                    ? {
                        label: "Add Manufacturer",
                        onClick: () => setIsFormOpen(true),
                        icon: Plus,
                      }
                    : undefined
                }
              />
            ) : (
              <DataTable
                data={manufacturers}
                columns={columns}
                sorting={sorting}
                onSortingChange={setSorting}
                pageSize={pageSize}
                pageSizeOptions={[10, 20, 30, 50, 100]}
                paginationLabels={{
                  showing: "Showing",
                  to: "to",
                  of: "of",
                  items: "manufacturers",
                  rowsPerPage: "Rows per page",
                  previous: "Previous",
                  next: "Next",
                  firstPage: "First page",
                  lastPage: "Last page",
                  previousPage: "Previous page",
                  nextPage: "Next page",
                }}
              />
            )}
          </div>
        </PageContentInner>
      </PageContent>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={`Delete ${manufacturerToDelete?.name || "manufacturer"}?`}
        description="This will deactivate the manufacturer. You can reactivate it later if needed."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        variant="destructive"
      />
    </Page>
  );
}
