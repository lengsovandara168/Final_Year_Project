"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useShop } from "@/contexts/shop-context";
import {
  Package,
  ChevronRight,
  Home,
  Eye,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";

// Mock orders data
const mockOrders = [
  {
    id: "ORD-2026-001",
    date: "Feb 18, 2026",
    status: "Delivered",
    total: 1299,
    items: [
      { name: "iPhone 15 Pro Max", quantity: 1, price: 1199 },
      { name: "MagSafe Charger", quantity: 1, price: 39 },
    ],
  },
  {
    id: "ORD-2026-002",
    date: "Feb 15, 2026",
    status: "Shipped",
    total: 449,
    items: [{ name: "Galaxy A54", quantity: 1, price: 449 }],
  },
  {
    id: "ORD-2026-003",
    date: "Feb 10, 2026",
    status: "Processing",
    total: 2098,
    items: [
      { name: "iPad Pro 12.9", quantity: 1, price: 1099 },
      { name: "Apple Watch Ultra 2", quantity: 1, price: 799 },
    ],
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Delivered":
      return "bg-green-100 text-green-700";
    case "Shipped":
      return "bg-blue-100 text-blue-700";
    case "Processing":
      return "bg-yellow-100 text-yellow-700";
    case "Cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function OrdersPage() {
  const { isAuthenticated, user } = useShop();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Please Login</h1>
        <p className="text-gray-500 mb-6">
          You need to be logged in to view your orders.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/en/login">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/en/register">Create Account</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-black flex items-center gap-1">
          <Home className="h-4 w-4" />
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-black font-medium">My Orders</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Orders</h1>
          <p className="text-gray-500">Welcome back, {user?.name}!</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/account">Account Settings</Link>
        </Button>
      </div>

      {mockOrders.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Orders Yet</h2>
            <p className="text-gray-500 mb-6">
              You haven&apos;t placed any orders yet.
            </p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {mockOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{order.id}</CardTitle>
                    <p className="text-sm text-gray-500">{order.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <span className="font-bold">
                      ${order.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} • ${item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/orders/${order.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                  {order.status === "Delivered" && (
                    <Button variant="outline" size="sm">
                      Buy Again
                    </Button>
                  )}
                  {order.status === "Shipped" && (
                    <Button variant="outline" size="sm">
                      Track Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
