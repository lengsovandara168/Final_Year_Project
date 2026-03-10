import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { TopProduct } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface TopSellingProductsProps {
  products?: TopProduct[];
}

export async function TopSellingProducts({
  products,
}: TopSellingProductsProps) {
  const t = await getTranslations("Dashboard");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("topSelling")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products?.map((product, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-500">{product.subtitle}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  ${product.revenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {product.sales} {t("sold")}
                </p>
              </div>
            </div>
          ))}
        </div>
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
            <div key={i} className="flex items-center justify-between">
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-4 w-16 ml-auto" />
                <Skeleton className="h-3 w-10 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
