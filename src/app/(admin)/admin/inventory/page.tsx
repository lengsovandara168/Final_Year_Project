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
import { Search, Plus, Minus, AlertTriangle, Package } from "lucide-react";

// Dummy inventory data
const initialInventory = [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    sku: "IPH-15PM-256",
    brand: "Apple",
    currentStock: 45,
    minStock: 10,
    maxStock: 100,
    lastRestocked: "2024-01-15",
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    sku: "SAM-S24U-512",
    brand: "Samsung",
    currentStock: 32,
    minStock: 15,
    maxStock: 80,
    lastRestocked: "2024-01-12",
  },
  {
    id: "3",
    name: "iPhone 14 Pro",
    sku: "IPH-14P-256",
    brand: "Apple",
    currentStock: 8,
    minStock: 10,
    maxStock: 60,
    lastRestocked: "2024-01-08",
  },
  {
    id: "4",
    name: "Samsung Galaxy Z Fold 5",
    sku: "SAM-ZF5-512",
    brand: "Samsung",
    currentStock: 0,
    minStock: 5,
    maxStock: 30,
    lastRestocked: "2023-12-20",
  },
  {
    id: "5",
    name: "iPad Pro 12.9",
    sku: "IPD-PRO-129",
    brand: "Apple",
    currentStock: 23,
    minStock: 10,
    maxStock: 50,
    lastRestocked: "2024-01-10",
  },
  {
    id: "6",
    name: "AirPods Pro",
    sku: "APP-PRO-2",
    brand: "Apple",
    currentStock: 67,
    minStock: 20,
    maxStock: 150,
    lastRestocked: "2024-01-14",
  },
  {
    id: "7",
    name: "Galaxy Buds 2 Pro",
    sku: "SAM-GB2P",
    brand: "Samsung",
    currentStock: 5,
    minStock: 15,
    maxStock: 80,
    lastRestocked: "2024-01-05",
  },
  {
    id: "8",
    name: "Pixel 8 Pro",
    sku: "GOO-P8P-256",
    brand: "Google",
    currentStock: 18,
    minStock: 10,
    maxStock: 40,
    lastRestocked: "2024-01-11",
  },
];

const getStockStatus = (current: number, min: number) => {
  if (current === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
  if (current < min) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
  return { label: "In Stock", color: "bg-green-100 text-green-800" };
};

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [inventory, setInventory] = useState(initialInventory);

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockItems = inventory.filter((item) => item.currentStock < item.minStock);
  const outOfStockItems = inventory.filter((item) => item.currentStock === 0);

  const adjustStock = (id: string, adjustment: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, currentStock: Math.max(0, item.currentStock + adjustment) }
          : item
      )
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Inventory</h1>
        <p className="text-sm text-gray-500">Monitor and manage stock levels</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-bold">{inventory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={lowStockItems.length > 0 ? "border-yellow-300" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={outOfStockItems.length > 0 ? "border-red-300" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Out of Stock</p>
                <p className="text-2xl font-bold">{outOfStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Stock Levels</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search inventory..."
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
                  <TableHead>SKU</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min/Max</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Restocked</TableHead>
                  <TableHead className="text-right">Quick Adjust</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => {
                  const status = getStockStatus(item.currentStock, item.minStock);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.brand}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.sku}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            item.currentStock < item.minStock
                              ? "text-red-600 font-medium"
                              : ""
                          }
                        >
                          {item.currentStock}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.minStock} / {item.maxStock}
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>{item.lastRestocked}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => adjustStock(item.id, -1)}
                            disabled={item.currentStock === 0}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => adjustStock(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => adjustStock(item.id, 10)}
                          >
                            +10
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
