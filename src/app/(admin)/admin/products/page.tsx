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
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";

// Dummy product data
const initialProducts = [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    category: "Phones",
    price: 1199,
    stock: 45,
    status: "In Stock",
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "Phones",
    price: 1299,
    stock: 32,
    status: "In Stock",
  },
  {
    id: "3",
    name: "iPhone 14 Pro",
    brand: "Apple",
    category: "Phones",
    price: 999,
    stock: 8,
    status: "Low Stock",
  },
  {
    id: "4",
    name: "Samsung Galaxy Z Fold 5",
    brand: "Samsung",
    category: "Phones",
    price: 1799,
    stock: 0,
    status: "Out of Stock",
  },
  {
    id: "5",
    name: "iPad Pro 12.9",
    brand: "Apple",
    category: "Tablets",
    price: 1099,
    stock: 23,
    status: "In Stock",
  },
  {
    id: "6",
    name: "AirPods Pro",
    brand: "Apple",
    category: "Accessories",
    price: 249,
    stock: 67,
    status: "In Stock",
  },
  {
    id: "7",
    name: "Galaxy Buds 2 Pro",
    brand: "Samsung",
    category: "Accessories",
    price: 199,
    stock: 5,
    status: "Low Stock",
  },
  {
    id: "8",
    name: "Pixel 8 Pro",
    brand: "Google",
    category: "Phones",
    price: 999,
    stock: 18,
    status: "In Stock",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "In Stock":
      return "bg-green-100 text-green-800";
    case "Low Stock":
      return "bg-yellow-100 text-yellow-800";
    case "Out of Stock":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState(initialProducts);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Products</h1>
          <p className="text-sm text-gray-500">Manage your product inventory</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Products ({filteredProducts.length})</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search products..."
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
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.brand}</p>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>${product.price.toLocaleString()}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(product.status)}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
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
