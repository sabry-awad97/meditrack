import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type OnChangeFn,
} from "@tanstack/react-table";
import { GripVertical } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-display/data-table/data-table-pagination";
import { cn } from "@/lib/utils";
import type { MedicineFormResponse } from "@/api/medicine-forms.api";

interface SortableTableProps {
  data: MedicineFormResponse[];
  columns: ColumnDef<MedicineFormResponse>[];
  onReorder: (formIds: string[]) => void;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  pageSize?: number;
  pageSizeOptions?: number[];
  paginationLabels?: {
    showing: string;
    to: string;
    of: string;
    items: string;
    rowsPerPage: string;
    previous: string;
    next: string;
    firstPage: string;
    lastPage: string;
    previousPage: string;
    nextPage: string;
  };
}

interface SortableRowProps {
  row: any;
  isRTL: boolean;
}

function SortableRow({ row, isRTL }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.original.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-state={row.getIsSelected() && "selected"}
      className={cn(isDragging && "opacity-50")}
    >
      {/* Drag Handle Column */}
      <TableCell className="w-[50px]">
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "cursor-grab active:cursor-grabbing",
            "text-muted-foreground hover:text-foreground transition-colors",
            "touch-none flex items-center justify-center",
          )}
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </TableCell>

      {/* Data Columns */}
      {row.getVisibleCells().map((cell: any) => (
        <TableCell key={cell.id} className={cn(isRTL && "text-right")}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function MedicineFormSortableTable({
  data,
  columns,
  onReorder,
  sorting,
  onSortingChange,
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 50, 100],
  paginationLabels,
}: SortableTableProps) {
  const [items, setItems] = useState(data);
  const [isDragging, setIsDragging] = useState(false);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Sync with props only when not dragging
  useEffect(() => {
    if (!isDragging) {
      setItems(data);
    }
  }, [data, isDragging]);

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualSorting: true,
    state: {
      sorting,
    },
    onSortingChange,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Send the new order to the backend
      const newOrder = newItems.map((item) => item.id);
      onReorder(newOrder);
    }
  };

  const isRTL = document.dir === "rtl";

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {/* Drag Handle Header */}
                  <TableHead className="w-[50px]" />

                  {/* Data Headers */}
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(isRTL && "text-right")}
                    >
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
              <SortableContext
                items={items}
                strategy={verticalListSortingStrategy}
              >
                {table.getRowModel().rows?.length ? (
                  table
                    .getRowModel()
                    .rows.map((row) => (
                      <SortableRow
                        key={row.original.id}
                        row={row}
                        isRTL={isRTL}
                      />
                    ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </SortableContext>
            </TableBody>
          </Table>
        </div>
      </DndContext>

      {/* Pagination */}
      <DataTablePagination
        table={table}
        totalItems={data.length}
        pageSizeOptions={pageSizeOptions}
        labels={paginationLabels}
      />
    </div>
  );
}
