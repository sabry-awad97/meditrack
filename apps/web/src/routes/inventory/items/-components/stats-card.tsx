import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}

export function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  return (
    <Card className="p-0 border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 py-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-1 rounded-md", color, "bg-opacity-10")}>
          <Icon className={cn("h-3.5 w-3.5", color.replace("bg-", "text-"))} />
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-2 pt-0">
        <div className="text-xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
