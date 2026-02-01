import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Archive,
  Globe,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useTranslation } from "@meditrack/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ManufacturerResponse } from "@/api/manufacturer.api";

interface UseManufacturerColumnsProps {
  t: (key: string) => string;
  isRTL: boolean;
  onViewDetails: (manufacturer: ManufacturerResponse) => void;
  onEdit: (manufacturer: ManufacturerResponse) => void;
  onDelete: (manufacturer: ManufacturerResponse) => void;
}

export function useManufacturerColumns({
  t,
  isRTL,
  onViewDetails,
  onEdit,
  onDelete,
}: UseManufacturerColumnsProps) {
  return useMemo<ColumnDef<ManufacturerResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("table.name"),
        cell: ({ row }) => (
          <div className="min-w-[200px]">
            <div className="font-medium">{row.original.name}</div>
            {row.original.short_name && (
              <div className="text-xs text-muted-foreground">
                {row.original.short_name}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "country",
        header: t("table.country"),
        cell: ({ row }) =>
          row.original.country ? (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{row.original.country}</span>
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">
              {t("table.na")}
            </span>
          ),
      },
      {
        accessorKey: "contact",
        header: t("table.contact"),
        cell: ({ row }) => (
          <div className="min-w-[180px] space-y-1">
            {row.original.phone && (
              <div className="flex items-center gap-2 text-xs">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="font-mono">{row.original.phone}</span>
              </div>
            )}
            {row.original.email && (
              <div className="flex items-center gap-2 text-xs">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span className="truncate">{row.original.email}</span>
              </div>
            )}
            {!row.original.phone && !row.original.email && (
              <span className="text-muted-foreground text-xs">
                {t("table.na")}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "website",
        header: t("table.website"),
        cell: ({ row }) =>
          row.original.website ? (
            <a
              href={row.original.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="truncate max-w-[150px]">
                {row.original.website.replace(/^https?:\/\//, "")}
              </span>
            </a>
          ) : (
            <span className="text-muted-foreground text-xs">
              {t("table.na")}
            </span>
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
          const manufacturer = row.original;

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
                <DropdownMenuItem onClick={() => onViewDetails(manufacturer)}>
                  <Eye className="h-4 w-4" />
                  <span>{t("actions.viewDetails")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(manufacturer)}>
                  <Edit className="h-4 w-4" />
                  <span>{t("actions.edit")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(manufacturer)}
                >
                  <Archive className="h-4 w-4" />
                  <span>{t("actions.delete")}</span>
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
