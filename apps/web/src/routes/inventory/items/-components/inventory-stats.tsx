import { Package, AlertTriangle, XCircle } from "lucide-react";
import { useTranslation } from "@meditrack/i18n";
import { PageSection } from "@/components/ui/page";
import { StatsCard } from "./stats-card";
import type { InventoryStatistics } from "@/api/inventory.api";

interface InventoryStatsProps {
  stats: InventoryStatistics | undefined;
}

export function InventoryStats({ stats }: InventoryStatsProps) {
  const { t } = useTranslation("inventory");

  if (!stats) return null;

  return (
    <PageSection className="mb-4 border-b border-dashed pb-4 shrink-0">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <StatsCard
          title={t("stats.totalItems")}
          value={stats.total_items}
          icon={Package}
          color="bg-blue-500"
        />
        <StatsCard
          title={t("stats.inStock")}
          value={stats.active_items}
          icon={Package}
          color="bg-green-500"
        />
        <StatsCard
          title={t("stats.lowStock")}
          value={stats.low_stock_count}
          icon={AlertTriangle}
          color="bg-yellow-500"
        />
        <StatsCard
          title={t("stats.outOfStock")}
          value={stats.out_of_stock_count}
          icon={XCircle}
          color="bg-red-500"
        />
        <StatsCard
          title={t("stats.totalValue")}
          value={`${stats.total_inventory_value.toFixed(2)}`}
          icon={Package}
          color="bg-purple-500"
        />
      </div>
    </PageSection>
  );
}
