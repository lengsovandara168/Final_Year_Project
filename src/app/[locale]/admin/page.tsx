import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { useTranslations } from "next-intl";

// Dummy data
function getStats(t: ReturnType<typeof useTranslations>) {
  return [
    {
      title: t("Dashboard.stats.totalRevenue"),
      value: "$45,231.89",
      change: t("Dashboard.stats.changeRevenue"),
      icon: DollarSign,
    },
    {
      title: t("Dashboard.stats.products"),
      value: "234",
      change: t("Dashboard.stats.changeProducts"),
      icon: Package,
    },
    {
      title: t("Dashboard.stats.totalOrders"),
      value: "1,234",
      change: t("Dashboard.stats.changeOrders"),
      icon: ShoppingCart,
    },
    {
      title: t("Dashboard.stats.customers"),
      value: "573",
      change: t("Dashboard.stats.changeCustomers"),
      icon: Users,
    },
  ];
}

const topSellingProducts = [
  {
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    sales: 145,
    revenue: "$174,000",
  },
  {
    name: "Galaxy S24 Ultra",
    brand: "Samsung",
    sales: 132,
    revenue: "$158,400",
  },
  { name: "iPhone 15", brand: "Apple", sales: 98, revenue: "$98,000" },
  { name: "Galaxy Z Fold 5", brand: "Samsung", sales: 76, revenue: "$136,800" },
  { name: "iPhone 14 Pro", brand: "Apple", sales: 67, revenue: "$67,000" },
];

const recentOrders = [
  {
    id: "#ORD-001",
    customer: "John Doe",
    items: 2,
    total: "$2,399",
    status: "completed",
  },
  {
    id: "#ORD-002",
    customer: "Jane Smith",
    items: 1,
    total: "$1,199",
    status: "processing",
  },
  {
    id: "#ORD-003",
    customer: "Mike Johnson",
    items: 3,
    total: "$3,597",
    status: "completed",
  },
  {
    id: "#ORD-004",
    customer: "Sarah Williams",
    items: 1,
    total: "$1,799",
    status: "pending",
  },
  {
    id: "#ORD-005",
    customer: "David Brown",
    items: 2,
    total: "$2,398",
    status: "processing",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
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

export default function DashboardPage() {
  const t = useTranslations();
  const stats = getStats(t);
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">
          {t("Dashboard.title")}
        </h1>
        <p className="text-sm text-gray-500 md:text-base">
          {t("Dashboard.welcome")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
        {stats.map((stat) => {
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
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Top Selling Products & Recent Orders */}
      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Dashboard.topSelling")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellingProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{product.revenue}</p>
                    <p className="text-sm text-gray-500">
                      {product.sales} {t("Dashboard.sold")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Dashboard.recentOrders")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-gray-500">{order.customer}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium">{order.total}</p>
                      <p className="text-sm text-gray-500">
                        {order.items} {t("Dashboard.items")}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {t(`Dashboard.status.${order.status}`)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
