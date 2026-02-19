"use client";

import { useState } from "react";
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
import { Search, UserPlus, Edit, Trash2, Shield, User } from "lucide-react";

// Dummy users data
const initialUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@phoneshop.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2024-01-15 14:32",
    createdAt: "2023-06-01",
  },
  {
    id: "2",
    name: "John Manager",
    email: "john@phoneshop.com",
    role: "Manager",
    status: "Active",
    lastLogin: "2024-01-15 12:15",
    createdAt: "2023-08-15",
  },
  {
    id: "3",
    name: "Sarah Sales",
    email: "sarah@phoneshop.com",
    role: "Staff",
    status: "Active",
    lastLogin: "2024-01-14 18:45",
    createdAt: "2023-09-20",
  },
  {
    id: "4",
    name: "Mike Support",
    email: "mike@phoneshop.com",
    role: "Staff",
    status: "Inactive",
    lastLogin: "2024-01-10 09:00",
    createdAt: "2023-10-05",
  },
  {
    id: "5",
    name: "Emily Cashier",
    email: "emily@phoneshop.com",
    role: "Staff",
    status: "Active",
    lastLogin: "2024-01-15 08:30",
    createdAt: "2023-11-12",
  },
];

const getRoleIcon = (role: string) => {
  switch (role) {
    case "Admin":
      return <Shield className="h-4 w-4" />;
    case "Manager":
      return <Shield className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "Admin":
      return "bg-purple-100 text-purple-800";
    case "Manager":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusColor = (status: string) => {
  return status === "Active"
    ? "bg-green-100 text-green-800"
    : "bg-red-100 text-red-800";
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState(initialUsers);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Users</h1>
          <p className="text-sm text-gray-500">Manage staff accounts and permissions</p>
        </div>
        <Button className="w-full sm:w-auto">
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.status === "Active").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Admins</p>
            <p className="text-2xl font-bold text-purple-600">
              {users.filter((u) => u.role === "Admin").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Staff</p>
            <p className="text-2xl font-bold">
              {users.filter((u) => u.role === "Staff").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Users</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-medium">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getRoleColor(user.role)} flex items-center gap-1 w-fit`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{user.lastLogin}</TableCell>
                    <TableCell className="text-sm">{user.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          disabled={user.role === "Admin"}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
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
