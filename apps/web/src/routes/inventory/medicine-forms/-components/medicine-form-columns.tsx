import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { MedicineFormResponse } from "@/api/medicine-forms.api";

interface UseMedicineFormColumnsProps {
  t: (key: string, options?: any) => string;
  isRTL: boolean;
  onViewDetails: (form: MedicineFormResponse) => void;
  onEdit: (form: MedicineFormResponse) => void;
  onDelete: (form: MedicineFormResponse) => void;
}

export function useMedicineFormColumns({
  t,
  isRTL,
  onViewDetails,
  onEdit,
  onDelete,
}: UseMedicineFormColumnsProps) {
  return useMemo<ColumnDef<MedicineFormResponse>[]>(
    () => [
      {
        accessorKey: "code",
        header: t("table.code"),
        cell: ({ row }) => (
          <div className="font-medium">{row.original.code}</div>
        ),
      },
      {
        accessorKey: "name_en",
        header: t("table.nameEn"),
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name_en}</div>
        ),
      },
      {
        accessorKey: "name_ar",
        header: t("table.nameAr"),
        cell: ({ row }) => (
          <div className="font-medium" dir="rtl">
            {row.original.name_ar}
          </div>
        ),
      },
      {
        accessorKey: "display_order",
        header: t("table.displayOrder"),
        cell: ({ row }) => (
          <div className="text-center">{row.original.display_order}</div>
        ),
      },
      {
        accessorKey: "is_active",
        header: t("table.status"),
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "default" : "secondary"}>
            {row.original.is_active ? t("table.active") : t("table.inactive")}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: t("table.actions"),
        cell: ({ row }) => {
          const form = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={(props) => (
                  <Button variant="ghost" className="h-8 w-8 p-0" {...props}>
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                )}
              />
              <DropdownMenuContent align={isRTL ? "start" : "end"}>
                <DropdownMenuItem
                  onClick={() => onViewDetails(form)}
                  className="cursor-pointer"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t("actions.viewDetails")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onEdit(form)}
                  className="cursor-pointer"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t("actions.edit")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(form)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("actions.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, isRTL, onViewDetails, onEdit, onDelete],
  );
}
