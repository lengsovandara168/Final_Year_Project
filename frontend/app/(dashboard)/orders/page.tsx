"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const mockOrders = [
  {
    id: 1,
    customer: "John Doe",
    totalAmount: 999,
    status: "completed" as const,
    items: 1,
    createdAt: "2026-02-01",
  },
  {
    id: 2,
    customer: "Jane Smith",
    totalAmount: 1798,
    status: "processing" as const,
    items: 2,
    createdAt: "2026-02-02",
  },
  {
    id: 3,
    customer: "Bob Johnson",
    totalAmount: 699,
    status: "pending" as const,
    items: 1,
    createdAt: "2026-02-03",
  },
];

const statusColors = {
  pending: "secondary",
  processing: "default",
  completed: "default",
  cancelled: "destructive",
} as const;

export default function OrdersPage() {
  const [orders] = useState(mockOrders);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Track and manage customer orders
          </p>
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 md:mx-0">
            <Table>
              <TableHeader>
                <TableRow className="text-xs md:text-sm">
                  <TableHead>Order ID</TableHead>
                  <TableHead className="hidden sm:table-cell">Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="text-xs md:text-sm">
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell className="hidden sm:table-cell">{order.customer}</TableCell>
                    <TableCell className="hidden md:table-cell">{order.items}</TableCell>
                    <TableCell>${order.totalAmount}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={statusColors[order.status]} className="text-xs">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs">{order.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <button className="text-xs md:text-sm text-primary hover:underline">
                        View
                      </button>
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
