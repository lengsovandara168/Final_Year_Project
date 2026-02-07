"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock data
const mockCustomers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    totalOrders: 5,
    createdAt: "2026-01-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1234567891",
    totalOrders: 3,
    createdAt: "2026-01-20",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    phone: "+1234567892",
    totalOrders: 8,
    createdAt: "2026-01-10",
  },
];

export default function CustomersPage() {
  const [customers] = useState(mockCustomers);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage your customer database
          </p>
        </div>
        <Button className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 md:mx-0">
            <Table>
              <TableHeader>
                <TableRow className="text-xs md:text-sm">
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">Orders</TableHead>
                  <TableHead className="hidden xl:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id} className="text-xs md:text-sm">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2 md:gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden xs:inline">{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs md:text-sm">{customer.email}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs md:text-sm">{customer.phone}</TableCell>
                    <TableCell className="hidden lg:table-cell">{customer.totalOrders}</TableCell>
                    <TableCell className="hidden xl:table-cell text-xs">{customer.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-xs md:text-sm">
                        View
                      </Button>
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
