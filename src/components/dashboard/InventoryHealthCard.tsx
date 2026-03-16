import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, PackageX } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { StockHealth } from "@/lib/api/dashboard";

interface InventoryHealthCardProps {
  locale: string;
  stockHealth: StockHealth;
}

export async function InventoryHealthCard({
  locale,
  stockHealth,
}: InventoryHealthCardProps) {
  const t = await getTranslations({ locale, namespace: "Dashboard" });

  const inStockPct =
    stockHealth.total > 0
      ? Math.round((stockHealth.inStock / stockHealth.total) * 100)
      : 0;

  const healthColor =
    inStockPct >= 70
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : inStockPct >= 40
        ? "bg-amber-100 text-amber-800 border-amber-200"
        : "bg-red-100 text-red-800 border-red-200";

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("analytics.stockHealth")}</CardTitle>
          <Badge className={healthColor}>
            {inStockPct}% {t("analytics.inStockRate")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {/* Segmented progress bar */}
        <div className="overflow-hidden rounded-full bg-muted" style={{ height: 12 }}>
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-700"
            style={{ width: `${inStockPct}%` }}
          />
        </div>

        {/* Stat boxes */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
              <Package className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">
                {stockHealth.inStock}
              </p>
              <p className="text-xs text-emerald-600">{t("analytics.inStock")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
              <PackageX className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {stockHealth.outOfStock}
              </p>
              <p className="text-xs text-red-500">{t("analytics.outOfStock")}</p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          {stockHealth.total} {t("analytics.totalUnits")}
        </p>
      </CardContent>
    </Card>
  );
}
