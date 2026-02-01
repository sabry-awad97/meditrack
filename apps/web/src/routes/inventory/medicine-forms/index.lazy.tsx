import { useMemo, useState } from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Plus, Tablets, CheckCircle2, XCircle, Package } from "lucide-react";
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
  useMedicineForms,
  useCreateMedicineForm,
  useUpdateMedicineForm,
  useDeleteMedicineForm,
  useReorderMedicineForms,
} from "@/hooks/use-medicine-forms";
import type {
  MedicineFormResponse,
  CreateMedicineForm,
  UpdateMedicineForm,
} from "@/api/medicine-forms.api";
import {
  useMedicineFormColumns,
  MedicineFormDetailsDialog,
  MedicineFormFormDialog,
  MedicineFormFilters,
  MedicineFormSortableTable,
} from "./-components";

// Generic components
import { EmptyState } from "@/components/feedback";
import { ConfirmationDialog } from "@/components/feedback";
import { StatsGrid, type StatItem } from "@/components/data-display";

export const Route = createLazyFileRoute("/inventory/medicine-forms/")({
  component: MedicineFormsComponent,
});

function MedicineFormsComponent() {
  const { t } = useTranslation("medicine-forms");
  const { isRTL } = useDirection();

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | null
  >(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [currentPage] = useState(1);
  const [pageSize] = useState(20);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedForm, setSelectedForm] = useState<MedicineFormResponse | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<MedicineFormResponse | null>(
    null,
  );

  // Build filters
  const filters = useMemo(() => {
    const filterObj: any = {};

    if (statusFilter && statusFilter !== "all") {
      filterObj.is_active = statusFilter === "active";
    }

    return Object.keys(filterObj).length > 0 ? filterObj : undefined;
  }, [statusFilter]);

  // Fetch data with pagination
  const { isLoading } = useMedicineForms(filters, {
    page: currentPage,
    page_size: pageSize,
  });

  // Fetch all forms for stats (without filters)
  const { data: allFormsData } = useMedicineForms();
  const allForms = allFormsData?.items || [];

  // Filter forms locally for accurate counts
  const filteredForms = useMemo(() => {
    return allForms.filter((form) => {
      const matchesSearch =
        !searchQuery ||
        form.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        form.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        form.name_ar.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        !statusFilter ||
        statusFilter === "all" ||
        (statusFilter === "active" && form.is_active) ||
        (statusFilter === "inactive" && !form.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [allForms, searchQuery, statusFilter]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter && statusFilter !== "all") count++;
    return count;
  }, [statusFilter]);

  const clearFilters = () => {
    setStatusFilter(null);
    setSearchQuery("");
  };

  const createForm = useCreateMedicineForm();
  const updateForm = useUpdateMedicineForm();
  const deleteForm = useDeleteMedicineForm();
  const reorderForms = useReorderMedicineForms();

  // Handlers
  const handleViewDetails = (form: MedicineFormResponse) => {
    setSelectedForm(form);
    setIsDetailsOpen(true);
  };

  const handleOpenCreateForm = () => {
    setSelectedForm(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleEdit = (form: MedicineFormResponse) => {
    setSelectedForm(form);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: CreateMedicineForm | UpdateMedicineForm) => {
    if (formMode === "create") {
      createForm.mutate(data as CreateMedicineForm);
    } else if (selectedForm) {
      updateForm.mutate({
        id: selectedForm.id,
        data: data as UpdateMedicineForm,
      });
    }
  };

  const handleDelete = (form: MedicineFormResponse) => {
    setFormToDelete(form);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (formToDelete) {
      deleteForm.mutate(formToDelete.id);
      setIsDeleteDialogOpen(false);
      setFormToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setFormToDelete(null);
  };

  const handleReorder = (formIds: string[]) => {
    reorderForms.mutate(formIds);
  };

  // Calculate stats from all forms (not filtered)
  const statsItems: StatItem[] = useMemo(() => {
    const activeCount = allForms.filter((f) => f.is_active).length;
    const inactiveCount = allForms.length - activeCount;

    return [
      {
        title: t("stats.total"),
        value: allForms.length,
        icon: Tablets,
        color: "bg-blue-500",
      },
      {
        title: t("stats.active"),
        value: activeCount,
        icon: CheckCircle2,
        color: "bg-green-500",
      },
      {
        title: t("stats.inactive"),
        value: inactiveCount,
        icon: XCircle,
        color: "bg-gray-500",
      },
      {
        title: t("stats.inUse"),
        value: allForms.filter((f) => f.is_active).length,
        icon: Package,
        color: "bg-purple-500",
      },
    ];
  }, [allForms, t]);

  // Table columns
  const columns = useMedicineFormColumns({
    t,
    isRTL,
    onViewDetails: handleViewDetails,
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  // Loading state
  if (isLoading) {
    return <Loading icon={Tablets} message={t("loading")} />;
  }

  return (
    <Page>
      <PageHeader>
        <PageHeaderTrigger />
        <PageHeaderContent>
          <PageHeaderTitle>{t("title")}</PageHeaderTitle>
          <PageHeaderDescription>{t("description")}</PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions className="flex gap-2">
          <Button
            size="default"
            className="gap-2"
            onClick={handleOpenCreateForm}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("addForm")}</span>
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <PageContent>
        <PageContentInner className="flex-1 flex flex-col min-h-0">
          {/* Statistics */}
          {statsItems.length > 0 && (
            <StatsGrid
              stats={statsItems}
              columns={{ default: 2, md: 2, lg: 4 }}
            />
          )}

          {/* Filters */}
          {allForms.length > 0 && (
            <MedicineFormFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              activeFiltersCount={activeFiltersCount}
              onClearFilters={clearFilters}
              totalItems={allForms.length}
              filteredItemsCount={filteredForms.length}
            />
          )}

          {/* Items Display */}
          <div className="flex-1 min-h-0">
            {filteredForms.length === 0 && !isLoading ? (
              <EmptyState
                icon={Tablets}
                title={
                  searchQuery || (statusFilter && statusFilter !== "all")
                    ? t("noFormsFound")
                    : t("noForms")
                }
                description={
                  searchQuery || (statusFilter && statusFilter !== "all")
                    ? t("adjustFilters")
                    : t("getStarted")
                }
                action={
                  !searchQuery && (!statusFilter || statusFilter === "all")
                    ? {
                        label: t("addForm"),
                        onClick: handleOpenCreateForm,
                        icon: Plus,
                      }
                    : undefined
                }
              />
            ) : (
              <MedicineFormSortableTable
                data={filteredForms}
                columns={columns}
                onReorder={handleReorder}
                sorting={sorting}
                onSortingChange={setSorting}
                pageSize={pageSize}
                pageSizeOptions={[10, 20, 30, 50, 100]}
                paginationLabels={{
                  showing: t("pagination.showing"),
                  to: t("pagination.to"),
                  of: t("pagination.of"),
                  items: t("pagination.items"),
                  rowsPerPage: t("pagination.rowsPerPage"),
                  previous: t("pagination.previous"),
                  next: t("pagination.next"),
                  firstPage: t("pagination.firstPage"),
                  lastPage: t("pagination.lastPage"),
                  previousPage: t("pagination.previousPage"),
                  nextPage: t("pagination.nextPage"),
                }}
              />
            )}
          </div>
        </PageContentInner>
      </PageContent>

      {/* Dialogs */}
      <MedicineFormDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        form={selectedForm}
      />

      <MedicineFormFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        form={selectedForm}
        mode={formMode}
        onSubmit={handleFormSubmit}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={t("delete.title", {
          name: formToDelete?.name_en || t("addForm"),
        })}
        description={t("delete.description")}
        confirmLabel={t("delete.confirm")}
        cancelLabel={t("delete.cancel")}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        variant="destructive"
      />
    </Page>
  );
}
