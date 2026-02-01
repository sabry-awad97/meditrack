import type { Table } from "@tanstack/react-table";
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDirection, useTranslation } from "@meditrack/i18n";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generatePaginationItems } from "./utils";

interface InventoryTablePaginationProps<T> {
  table: Table<T>;
  totalItems: number;
}

export function InventoryTablePagination<T>({
  table,
  totalItems,
}: InventoryTablePaginationProps<T>) {
  const { isRTL } = useDirection();
  const { t } = useTranslation("inventory");

  return (
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
          {isRTL ? (
            <>
              <span>Previous</span>
              <ChevronRight className="h-4 w-4" />
            </>
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </>
          )}
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
          {isRTL ? (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Next</span>
            </>
          ) : (
            <>
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Tablet & Desktop: Full pagination */}
      <div className="hidden sm:flex flex-col lg:flex-row items-center justify-between gap-4 px-4">
        {/* Items info and page size selector */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {t("pagination.showing")}{" "}
            <span className="font-medium text-foreground">
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}
            </span>{" "}
            {t("pagination.to")}{" "}
            <span className="font-medium text-foreground">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                totalItems,
              )}
            </span>{" "}
            {t("pagination.of")}{" "}
            <span className="font-medium text-foreground">{totalItems}</span>{" "}
            {t("pagination.items")}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {t("pagination.rowsPerPage")}
            </span>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
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
                  {isRTL ? (
                    <ChevronsRight className="h-4 w-4" />
                  ) : (
                    <ChevronsLeft className="h-4 w-4" />
                  )}
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
                  {isRTL ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                  <span className="sr-only">Previous page</span>
                </Button>
              </PaginationItem>

              {/* Page numbers */}
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
                        onClick={() => table.setPageIndex(item as number)}
                        isActive={
                          table.getState().pagination.pageIndex === item
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
                  {isRTL ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="sr-only">Next page</span>
                </Button>
              </PaginationItem>

              {/* Last page button */}
              <PaginationItem className="hidden md:block">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  {isRTL ? (
                    <ChevronsLeft className="h-4 w-4" />
                  ) : (
                    <ChevronsRight className="h-4 w-4" />
                  )}
                  <span className="sr-only">Last page</span>
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
