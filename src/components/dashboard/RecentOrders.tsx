import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";
import { RecentOrder } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentOrdersProps {
  orders?: RecentOrder[];
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-black text-white";
    case "processing":
      return "bg-gray-800 text-white";
    case "pending":
      return "bg-gray-400 text-white";
    default:
      return "bg-gray-200";
  }
};

export async function RecentOrders({ orders }: RecentOrdersProps) {
  const t = await getTranslations("Dashboard");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recentOrders")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders?.map((order) => (
            <div key={order.id} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">{order.id}</p>
                <p className="text-sm text-gray-500">{order.customer}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-medium">${order.total.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    {order.items} {t("items")}
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {t(`status.${order.status.toLowerCase()}`)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentOrdersSkeleton() {
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
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-25" />
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right space-y-1">
                  <Skeleton className="h-4 w-15 ml-auto" />
                  <Skeleton className="h-3 w-10 ml-auto" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
