"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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

// Mock data - will be replaced with API calls
const mockProducts = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    brand: "Apple",
    model: "A2848",
    price: 999,
    stock: 25,
    category: "Flagship",
  },
  {
    id: 2,
    name: "Samsung Galaxy S24",
    brand: "Samsung",
    model: "SM-S921B",
    price: 899,
    stock: 18,
    category: "Flagship",
  },
  {
    id: 3,
    name: "Google Pixel 8",
    brand: "Google",
    model: "GC3VE",
    price: 699,
    stock: 0,
    category: "Mid-range",
  },
];

export default function ProductsPage() {
  const [products] = useState(mockProducts);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage your phone inventory
          </p>
        </div>
        <Button className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Product Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 md:mx-0">
            <Table>
              <TableHeader>
                <TableRow className="text-xs md:text-sm">
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Brand</TableHead>
                  <TableHead className="hidden md:table-cell">Model</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden sm:table-cell">Stock</TableHead>
                  <TableHead className="hidden lg:table-cell">Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="text-xs md:text-sm">
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{product.brand}</TableCell>
                    <TableCell className="hidden md:table-cell">{product.model}</TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant={product.stock > 0 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {product.stock > 0 ? `${product.stock}` : "Out"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{product.category}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-xs md:text-sm">
                        Edit
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
