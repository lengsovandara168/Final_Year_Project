// f:/AUPP/2026/FYP/FYP_Project/src/components/dashboard/stats-cards.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { DashboardStats } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  stats?: DashboardStats;
}

export async function StatsCards({ stats }: StatsCardsProps) {
  const t = await getTranslations("Dashboard");

  const statItems = [
    {
      title: t("stats.totalRevenue"),
      value: stats?.totalRevenue
        ? `$${stats.totalRevenue.toLocaleString()}`
        : ".00",
      change: stats?.revenueChange
        ? `${stats.revenueChange > 0 ? "+" : ""}${stats.revenueChange}%`
        : "0%",
      description: t("stats.changeRevenue"),
      icon: DollarSign,
    },
    {
      title: t("stats.products"),
      value: stats?.products?.toString() || "0",
      change: stats?.productsChange
        ? `${stats.productsChange > 0 ? "+" : ""}${stats.productsChange}%`
        : "0%",
      description: t("stats.changeProducts"),
      icon: Package,
    },
    {
      title: t("stats.totalOrders"),
      value: stats?.totalOrders?.toString() || "0",
      change: stats?.ordersChange
        ? `${stats.ordersChange > 0 ? "+" : ""}${stats.ordersChange}%`
        : "0%",
      description: t("stats.changeOrders"),
      icon: ShoppingCart,
    },
    {
      title: t("stats.customers"),
      value: stats?.customers?.toString() || "0",
      change: stats?.customersChange
        ? `${stats.customersChange > 0 ? "+" : ""}${stats.customersChange}%`
        : "0%",
      description: t("stats.changeCustomers"),
      icon: Users,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">
                <span
                  className={
                    stat.change.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {stat.change}
                </span>{" "}
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[120px] mb-2" />
            <Skeleton className="h-3 w-[140px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
