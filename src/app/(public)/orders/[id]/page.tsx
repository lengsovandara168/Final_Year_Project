"use client";

import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useShop } from "@/contexts/shop-context";
import {
  Package,
  ChevronRight,
  Home,
  Truck,
  CheckCircle,
  Circle,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";

// Mock order detail
const mockOrder = {
  id: "ORD-2026-001",
  date: "Feb 18, 2026",
  status: "Delivered",
  total: 1299,
  subtotal: 1238,
  shipping: 0,
  tax: 61,
  items: [
    { name: "iPhone 15 Pro Max", quantity: 1, price: 1199, brand: "Apple" },
    { name: "MagSafe Charger", quantity: 1, price: 39, brand: "Apple" },
  ],
  shipping_address: {
    name: "John Doe",
    address: "123 Main Street",
    city: "San Francisco",
    state: "CA",
    zip: "94102",
    phone: "+1 (555) 123-4567",
    email: "john@example.com",
  },
  timeline: [
    { status: "Order Placed", date: "Feb 18, 2026 10:30 AM", done: true },
    { status: "Payment Confirmed", date: "Feb 18, 2026 10:32 AM", done: true },
    { status: "Processing", date: "Feb 18, 2026 2:00 PM", done: true },
    { status: "Shipped", date: "Feb 19, 2026 9:00 AM", done: true },
    { status: "Delivered", date: "Feb 20, 2026 3:30 PM", done: true },
  ],
};

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

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isAuthenticated } = useShop();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Please Login</h1>
        <p className="text-gray-500 mb-6">
          You need to be logged in to view order details.
        </p>
        <Button asChild>
          <Link href="/">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  // In real app, fetch order by ID
  const order = mockOrder;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-black flex items-center gap-1">
          <Home className="h-4 w-4" />
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/orders" className="hover:text-black">
          My Orders
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-black font-medium">{id}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Order {order.id}</h1>
          <p className="text-gray-500">Placed on {order.date}</p>
        </div>
        <Badge className={`${getStatusColor(order.status)} text-sm px-4 py-1`}>
          {order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-100">
                      <span className="text-xl font-bold text-gray-400">
                        {item.brand.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.brand}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.price}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.timeline.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {step.done ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-300" />
                      )}
                      {index < order.timeline.length - 1 && (
                        <div
                          className={`w-px h-12 ${
                            step.done ? "bg-green-600" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                    <div className="pb-8">
                      <p
                        className={`font-medium ${
                          step.done ? "text-black" : "text-gray-400"
                        }`}
                      >
                        {step.status}
                      </p>
                      <p className="text-sm text-gray-500">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary & Shipping */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>${order.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className={order.shipping === 0 ? "text-green-600" : ""}>
                  {order.shipping === 0 ? "Free" : `$${order.shipping}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span>${order.tax}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${order.total}</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{order.shipping_address.name}</p>
              <p className="text-gray-600">{order.shipping_address.address}</p>
              <p className="text-gray-600">
                {order.shipping_address.city}, {order.shipping_address.state}{" "}
                {order.shipping_address.zip}
              </p>
              <div className="flex items-center gap-2 text-gray-600 pt-2">
                <Phone className="h-4 w-4" />
                {order.shipping_address.phone}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" />
                {order.shipping_address.email}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button className="w-full" variant="outline">
              Download Invoice
            </Button>
            <Button className="w-full" variant="outline">
              Need Help?
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
