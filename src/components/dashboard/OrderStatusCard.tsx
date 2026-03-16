import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

const STATUS_COLORS: Record<string, { bar: string; dot: string }> = {
  completed: { bar: "bg-emerald-500", dot: "bg-emerald-500" },
  processing: { bar: "bg-blue-500", dot: "bg-blue-500" },
  pending: { bar: "bg-amber-400", dot: "bg-amber-400" },
  cancelled: { bar: "bg-red-500", dot: "bg-red-500" },
};

interface OrderStatusCardProps {
  locale: string;
  ordersByStatus: Record<string, number>;
  totalOrders: number;
}

export async function OrderStatusCard({
  locale,
  ordersByStatus,
  totalOrders,
}: OrderStatusCardProps) {
  const t = await getTranslations({ locale, namespace: "Dashboard" });

  const knownLabels: Record<string, string> = {
    completed: t("status.completed"),
    processing: t("status.processing"),
    pending: t("status.pending"),
  };

  const entries = Object.entries(ordersByStatus).sort((a, b) => b[1] - a[1]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("analytics.ordersByStatus")}</CardTitle>
          <span className="text-sm text-muted-foreground">
            {totalOrders} {t("items")}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {entries.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            {t("analytics.noOrders")}
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map(([status, count]) => {
              const pct =
                totalOrders > 0
                  ? Math.round((count / totalOrders) * 100)
                  : 0;
              const colors =
                STATUS_COLORS[status] ?? {
                  bar: "bg-gray-400",
                  dot: "bg-gray-400",
                };
              const label =
                knownLabels[status] ??
                status.charAt(0).toUpperCase() + status.slice(1);
              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${colors.dot}`}
                      />
                      <span className="font-medium">{label}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {count}{" "}
                      <span className="text-xs">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${colors.bar} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
