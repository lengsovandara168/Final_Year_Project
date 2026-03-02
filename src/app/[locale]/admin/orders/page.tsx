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
import { Search, ChevronDown, Eye, AlertCircle } from "lucide-react";
import { getOrders } from "@/lib/api/orders";
import { cookies } from "next/headers";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
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

const getSourceBadge = (source: string) => {
  return source?.toLowerCase() === "pos"
    ? "bg-blue-100 text-blue-800"
    : "bg-green-100 text-green-800";
};

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value || "";

  let orders = [];
  let error: string | null = null;

  if (!accessToken) {
    error = "No access token found. Please log in.";
  } else {
    try {
      const response = await getOrders(accessToken);
      orders = response.data;
    } catch (err) {
      console.error("Failed to fetch orders:", err);
  
      error =
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "Orders endpoint not yet implemented. Please check back soon.";
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Order Management</h1>
        <p className="text-sm text-gray-500 md:text-base">
          Track and manage orders from POS and online store
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-blue-900">
              Orders Endpoint Coming Soon
            </p>
            <p className="text-sm text-blue-700">
              Backend needs to implement:{" "}
              <code className="bg-blue-100 px-1 rounded">
                GET /v1/admin/orders
              </code>
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Once implemented, real order data will appear here automatically.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>
              All Orders {orders.length > 0 && `(${orders.length})`}
            </CardTitle>
            <div className="flex flex-col gap-4 sm:flex-row">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Filter Status
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>All</DropdownMenuItem>
                  <DropdownMenuItem>Pending</DropdownMenuItem>
                  <DropdownMenuItem>Processing</DropdownMenuItem>
                  <DropdownMenuItem>Completed</DropdownMenuItem>
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
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">No orders found</p>
              <p className="text-sm">
                Orders will appear here once you have sales
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-sm text-gray-500">{order.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{order.items}</TableCell>
                      <TableCell className="font-medium">
                        $
                        {typeof order.total === "number"
                          ? order.total.toFixed(2)
                          : order.total}
                      </TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getSourceBadge(order.source || "")}
                        >
                          {order.source || "Online"}
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
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
