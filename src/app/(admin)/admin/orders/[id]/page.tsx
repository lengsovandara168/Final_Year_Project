"use client";

import { use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from "lucide-react";

// Dummy order data
const getOrderById = (id: string) => ({
  id,
  customer: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 234 567 890",
  },
  shippingAddress: {
    street: "123 Main Street",
    city: "Los Angeles",
    state: "CA",
    zip: "90001",
    country: "United States",
  },
  items: [
    {
      id: "1",
      name: "iPhone 15 Pro Max",
      variant: "256GB - Natural Titanium",
      price: 1199,
      quantity: 1,
    },
    {
      id: "2",
      name: "AirPods Pro",
      variant: "2nd Generation",
      price: 249,
      quantity: 2,
    },
  ],
  subtotal: 1697,
  shipping: 0,
  tax: 135.76,
  total: 1832.76,
  status: "Processing",
  paymentMethod: "Credit Card (**** 4242)",
  createdAt: "2024-01-15 14:32",
  timeline: [
    { status: "Order Placed", date: "2024-01-15 14:32", completed: true },
    { status: "Payment Confirmed", date: "2024-01-15 14:35", completed: true },
    { status: "Processing", date: "2024-01-15 15:00", completed: true },
    { status: "Shipped", date: null, completed: false },
    { status: "Delivered", date: null, completed: false },
  ],
});

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800";
    case "Processing":
      return "bg-blue-100 text-blue-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Shipped":
      return "bg-purple-100 text-purple-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const order = getOrderById(id);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Order {order.id}</h1>
            <p className="text-sm text-gray-500">Placed on {order.createdAt}</p>
          </div>
          <Badge className={`${getStatusColor(order.status)} w-fit`}>
            {order.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Order Items & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.variant}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                    {index < order.items.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          event.completed
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {event.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      {index < order.timeline.length - 1 && (
                        <div
                          className={`h-8 w-0.5 ${
                            event.completed ? "bg-green-200" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                    <div className="pb-4">
                      <p
                        className={`font-medium ${
                          event.completed ? "" : "text-gray-400"
                        }`}
                      >
                        {event.status}
                      </p>
                      <p className="text-sm text-gray-500">
                        {event.date || "Pending"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Customer & Payment Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{order.customer.name}</p>
              <p className="text-sm text-gray-500">{order.customer.email}</p>
              <p className="text-sm text-gray-500">{order.customer.phone}</p>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {order.shippingAddress.street}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.zip}
                <br />
                {order.shippingAddress.country}
              </p>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>${order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span>{order.shipping === 0 ? "Free" : `$${order.shipping}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span>${order.tax}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${order.total.toLocaleString()}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Method</span>
                <span>{order.paymentMethod}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <Button className="w-full">
                <Truck className="mr-2 h-4 w-4" />
                Mark as Shipped
              </Button>
              <Button variant="outline" className="w-full">
                Print Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
