import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { TopProduct } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

interface TopSellingProductsProps {
  locale: string;
  products?: TopProduct[];
}

const RANK_STYLES = [
  "bg-amber-400 text-white",
  "bg-gray-300 text-gray-700",
  "bg-orange-400 text-white",
  "bg-gray-100 text-gray-500",
  "bg-gray-100 text-gray-500",
];

export async function TopSellingProducts({
  locale,
  products,
}: TopSellingProductsProps) {
  const t = await getTranslations({ locale, namespace: "Dashboard" });

  const maxRevenue = Math.max(...(products ?? []).map((p) => p.revenue), 1);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("topSelling")}</CardTitle>
          <Link
            href={`/${locale}/admin/products`}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {t("analytics.manageProducts")}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {!products || products.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            {t("analytics.noOrders")}
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product, index) => (
              <div key={index} className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    RANK_STYLES[index] ?? RANK_STYLES[4]
                  }`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="shrink-0 text-sm font-semibold">
                      {product.revenue > 0
                        ? `$${product.revenue.toLocaleString()}`
                        : "—"}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${Math.round((product.revenue / maxRevenue) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {product.sales > 0
                        ? `${product.sales} ${t("sold")}`
                        : product.subtitle}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TopSellingProductsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-35" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
