import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";

// Dummy data
const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1% from last month",
    icon: DollarSign,
  },
  {
    title: "Products",
    value: "234",
    change: "+12 new this week",
    icon: Package,
  },
  {
    title: "Total Orders",
    value: "1,234",
    change: "+19% from last month",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    value: "573",
    change: "+28 new this week",
    icon: Users,
  },
];

const topSellingProducts = [
  { name: "iPhone 15 Pro Max", brand: "Apple", sales: 145, revenue: "$174,000" },
  { name: "Galaxy S24 Ultra", brand: "Samsung", sales: 132, revenue: "$158,400" },
  { name: "iPhone 15", brand: "Apple", sales: 98, revenue: "$98,000" },
  { name: "Galaxy Z Fold 5", brand: "Samsung", sales: 76, revenue: "$136,800" },
  { name: "iPhone 14 Pro", brand: "Apple", sales: 67, revenue: "$67,000" },
];

const recentOrders = [
  { id: "#ORD-001", customer: "John Doe", items: 2, total: "$2,399", status: "Completed" },
  { id: "#ORD-002", customer: "Jane Smith", items: 1, total: "$1,199", status: "Processing" },
  { id: "#ORD-003", customer: "Mike Johnson", items: 3, total: "$3,597", status: "Completed" },
  { id: "#ORD-004", customer: "Sarah Williams", items: 1, total: "$1,799", status: "Pending" },
  { id: "#ORD-005", customer: "David Brown", items: 2, total: "$2,398", status: "Processing" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-black text-white";
    case "Processing":
      return "bg-gray-800 text-white";
    case "Pending":
      return "bg-gray-400 text-white";
    default:
      return "bg-gray-200";
  }
};

export default function AdminDashboardPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>
        <p className="text-sm text-gray-500 md:text-base">Welcome back! Here&apos;s what&apos;s happening today.</p>
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
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellingProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{product.revenue}</p>
                    <p className="text-sm text-gray-500">{product.sales} sales</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-gray-500 truncate">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.total}</p>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
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
