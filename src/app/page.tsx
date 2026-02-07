import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";

export default function Home() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      icon: DollarSign,
      description: "+20.1% from last month",
    },
    {
      title: "Products",
      value: "152",
      icon: Package,
      description: "12 new this week",
    },
    {
      title: "Orders",
      value: "+573",
      icon: ShoppingCart,
      description: "+201 from last month",
    },
    {
      title: "Customers",
      value: "+2,350",
      icon: Users,
      description: "+180 from last month",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Welcome to your phone shop management system
        </p>
      </div>
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-4">
        <Card className="lg:col-span-1 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm md:text-base">
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Product statistics will be displayed here
            </p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm md:text-base">
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Order list will be displayed here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
