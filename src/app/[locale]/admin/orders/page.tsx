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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, Eye, Info } from "lucide-react";

// Dummy order data
const orders = [
  {
    id: "#ORD-001",
    customer: "John Doe",
    email: "john.doe@email.com",
    items: 2,
    total: "$2,399",
    date: "2026-02-07",
    status: "Completed",
    source: "POS",
  },
  {
    id: "#ORD-002",
    customer: "Jane Smith",
    email: "jane.smith@email.com",
    items: 1,
    total: "$1,199",
    date: "2026-02-07",
    status: "Processing",
    source: "Online",
  },
  {
    id: "#ORD-003",
    customer: "Mike Johnson",
    email: "mike.j@email.com",
    items: 3,
    total: "$3,597",
    date: "2026-02-06",
    status: "Completed",
    source: "POS",
  },
  {
    id: "#ORD-004",
    customer: "Sarah Williams",
    email: "sarah.w@email.com",
    items: 1,
    total: "$1,799",
    date: "2026-02-06",
    status: "Pending",
    source: "Online",
  },
  {
    id: "#ORD-005",
    customer: "David Brown",
    email: "david.b@email.com",
    items: 2,
    total: "$2,398",
    date: "2026-02-05",
    status: "Processing",
    source: "Online",
  },
  {
    id: "#ORD-006",
    customer: "Emma Davis",
    email: "emma.d@email.com",
    items: 1,
    total: "$799",
    date: "2026-02-05",
    status: "Completed",
    source: "POS",
  },
  {
    id: "#ORD-007",
    customer: "James Wilson",
    email: "james.w@email.com",
    items: 2,
    total: "$1,798",
    date: "2026-02-04",
    status: "Completed",
    source: "Online",
  },
  {
    id: "#ORD-008",
    customer: "Olivia Martinez",
    email: "olivia.m@email.com",
    items: 1,
    total: "$1,299",
    date: "2026-02-04",
    status: "Pending",
    source: "POS",
  },
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

const getSourceBadge = (source: string) => {
  return source === "POS" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800";
};

export default function OrdersPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Order Management</h1>
        <p className="text-sm text-gray-500 md:text-base">Track and manage orders from POS and online store</p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-blue-900">Coming Soon: Real Orders Data</p>
          <p className="text-sm text-blue-700">This page currently shows sample data. Real orders will be available once the backend implements the orders endpoint.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Orders</CardTitle>
            <div className="flex flex-col gap-4 sm:flex-row">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    All Orders
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>All Orders</DropdownMenuItem>
                  <DropdownMenuItem>Completed</DropdownMenuItem>
                  <DropdownMenuItem>Processing</DropdownMenuItem>
                  <DropdownMenuItem>Pending</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input placeholder="Search orders..." className="pl-8" />
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
                <TableHead>Email</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell className="text-gray-500">{order.email}</TableCell>
                  <TableCell>{order.items}</TableCell>
                  <TableCell className="font-medium">{order.total}</TableCell>
                  <TableCell className="text-gray-500">{order.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getSourceBadge(order.source)}>
                      {order.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>          </div>        </CardContent>
      </Card>
    </div>
  );
}
