"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, Package, Clock, CheckCircle, XCircle } from "lucide-react";

// Dummy orders data
const orders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    email: "john@example.com",
    items: 2,
    total: 2399,
    status: "Completed",
    date: "2024-01-15 14:32",
    paymentMethod: "Credit Card",
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    email: "jane@example.com",
    items: 1,
    total: 1199,
    status: "Processing",
    date: "2024-01-15 12:15",
    paymentMethod: "PayPal",
  },
  {
    id: "ORD-003",
    customer: "Mike Johnson",
    email: "mike@example.com",
    items: 3,
    total: 3597,
    status: "Completed",
    date: "2024-01-14 18:45",
    paymentMethod: "Credit Card",
  },
  {
    id: "ORD-004",
    customer: "Sarah Williams",
    email: "sarah@example.com",
    items: 1,
    total: 1799,
    status: "Pending",
    date: "2024-01-14 16:22",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "ORD-005",
    customer: "David Brown",
    email: "david@example.com",
    items: 2,
    total: 2398,
    status: "Processing",
    date: "2024-01-14 11:08",
    paymentMethod: "Credit Card",
  },
  {
    id: "ORD-006",
    customer: "Emily Davis",
    email: "emily@example.com",
    items: 1,
    total: 999,
    status: "Cancelled",
    date: "2024-01-13 09:55",
    paymentMethod: "PayPal",
  },
  {
    id: "ORD-007",
    customer: "Chris Wilson",
    email: "chris@example.com",
    items: 4,
    total: 4796,
    status: "Shipped",
    date: "2024-01-12 15:33",
    paymentMethod: "Credit Card",
  },
  {
    id: "ORD-008",
    customer: "Lisa Anderson",
    email: "lisa@example.com",
    items: 2,
    total: 2198,
    status: "Completed",
    date: "2024-01-12 10:12",
    paymentMethod: "Credit Card",
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Completed":
      return <CheckCircle className="h-4 w-4" />;
    case "Cancelled":
      return <XCircle className="h-4 w-4" />;
    case "Processing":
    case "Pending":
      return <Clock className="h-4 w-4" />;
    case "Shipped":
      return <Package className="h-4 w-4" />;
    default:
      return null;
  }
};

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

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
    processing: orders.filter((o) => o.status === "Processing").length,
    completed: orders.filter((o) => o.status === "Completed").length,
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Orders</h1>
        <p className="text-sm text-gray-500">View and manage customer orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold">{orderStats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Processing</p>
            <p className="text-2xl font-bold text-blue-600">{orderStats.processing}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{orderStats.completed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Orders</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-gray-500">{order.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>${order.total.toLocaleString()}</TableCell>
                    <TableCell>{order.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{order.date}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
