import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, AlertCircle } from "lucide-react";
import { getCustomers } from "@/lib/api/customers";
import { cookies } from "next/headers";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function CustomersPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value || "";

  let customers = [];
  let error: string | null = null;

  if (!accessToken) {
    error = "No access token found. Please log in.";
  } else {
    try {
      const response = await getCustomers(accessToken);
      customers = response.data;
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      // Gracefully handle missing endpoint - show empty state instead of error
      error =
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "Customers endpoint not yet implemented. Please check back soon.";
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Customer Database</h1>
        <p className="text-sm text-gray-500 md:text-base">
          Manage customer profiles and track loyalty
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-blue-900">
              Customers Endpoint Coming Soon
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Once implemented, real customer data will appear here
              automatically.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>
              All Customers {customers.length > 0 && `(${customers.length})`}
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input placeholder="Search customers..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">No customers found</p>
              <p className="text-sm">
                Customers will appear here once you have registrations
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Total Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-black text-white text-xs">
                              {getInitials(customer.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{customer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {customer.email}
                      </TableCell>
                      <TableCell>{customer.phone || "-"}</TableCell>
                      <TableCell className="text-center">
                        {customer.totalOrders}
                      </TableCell>
                      <TableCell className="font-medium">
                        $
                        {typeof customer.totalSpent === "number"
                          ? customer.totalSpent.toFixed(2)
                          : customer.totalSpent}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {customer.joinedDate}
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
