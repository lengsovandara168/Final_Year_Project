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
import { Search, Eye } from "lucide-react";

// Dummy customer data
const customers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    totalOrders: 12,
    totalSpent: "$14,388",
    joinedDate: "2025-08-15",
    initials: "JD",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "+1 (555) 234-5678",
    totalOrders: 8,
    totalSpent: "$9,592",
    joinedDate: "2025-09-22",
    initials: "JS",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.j@email.com",
    phone: "+1 (555) 345-6789",
    totalOrders: 15,
    totalSpent: "$17,985",
    joinedDate: "2025-07-10",
    initials: "MJ",
  },
  {
    id: 4,
    name: "Sarah Williams",
    email: "sarah.w@email.com",
    phone: "+1 (555) 456-7890",
    totalOrders: 5,
    totalSpent: "$5,995",
    joinedDate: "2025-11-03",
    initials: "SW",
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.b@email.com",
    phone: "+1 (555) 567-8901",
    totalOrders: 10,
    totalSpent: "$11,990",
    joinedDate: "2025-10-18",
    initials: "DB",
  },
  {
    id: 6,
    name: "Emma Davis",
    email: "emma.d@email.com",
    phone: "+1 (555) 678-9012",
    totalOrders: 6,
    totalSpent: "$7,194",
    joinedDate: "2025-12-05",
    initials: "ED",
  },
  {
    id: 7,
    name: "James Wilson",
    email: "james.w@email.com",
    phone: "+1 (555) 789-0123",
    totalOrders: 9,
    totalSpent: "$10,791",
    joinedDate: "2025-09-01",
    initials: "JW",
  },
  {
    id: 8,
    name: "Olivia Martinez",
    email: "olivia.m@email.com",
    phone: "+1 (555) 890-1234",
    totalOrders: 7,
    totalSpent: "$8,393",
    joinedDate: "2025-10-27",
    initials: "OM",
  },
];

export default function CustomersPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Customer Database</h1>
        <p className="text-sm text-gray-500 md:text-base">Manage customer profiles and track loyalty</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Customers</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input placeholder="Search customers..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
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
                      <Avatar>
                        <AvatarFallback className="bg-gray-200 text-gray-700">
                          {customer.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500">{customer.email}</TableCell>
                  <TableCell className="text-gray-500">{customer.phone}</TableCell>
                  <TableCell>{customer.totalOrders}</TableCell>
                  <TableCell className="font-medium">{customer.totalSpent}</TableCell>
                  <TableCell className="text-gray-500">{customer.joinedDate}</TableCell>
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
