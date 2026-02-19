"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, AlertTriangle, CheckCircle, ArrowLeft, Home } from "lucide-react";

// Sample inventory data
const inventory = [
  { id: "1", name: "iPhone 15 Pro Max", sku: "IPH-15PM-256", stock: 45, minStock: 10, price: 1199 },
  { id: "2", name: "Samsung Galaxy S24", sku: "SAM-S24-256", stock: 32, minStock: 15, price: 899 },
  { id: "3", name: "iPhone 15", sku: "IPH-15-128", stock: 28, minStock: 10, price: 799 },
  { id: "4", name: "iPhone 14 Pro", sku: "IPH-14P-256", stock: 8, minStock: 10, price: 899 },
  { id: "5", name: "Pixel 8 Pro", sku: "GOO-P8P-256", stock: 18, minStock: 10, price: 999 },
  { id: "6", name: "iPad Pro 12.9", sku: "IPD-PRO-129", stock: 23, minStock: 10, price: 1099 },
  { id: "7", name: "Galaxy Tab S9", sku: "SAM-TS9-256", stock: 15, minStock: 10, price: 849 },
  { id: "8", name: "AirPods Pro", sku: "APP-PRO-2", stock: 67, minStock: 20, price: 249 },
  { id: "9", name: "Galaxy Buds 2 Pro", sku: "SAM-GB2P", stock: 5, minStock: 15, price: 199 },
  { id: "10", name: "Apple Watch Ultra", sku: "AWU-2-49", stock: 12, minStock: 8, price: 799 },
  { id: "11", name: "Galaxy Watch 6", sku: "SAM-GW6-44", stock: 20, minStock: 10, price: 399 },
  { id: "12", name: "MagSafe Charger", sku: "APP-MAG-CHG", stock: 100, minStock: 30, price: 39 },
  { id: "13", name: "USB-C Cable", sku: "GEN-USBC-1M", stock: 0, minStock: 50, price: 19 },
  { id: "14", name: "Screen Protector", sku: "GEN-SCRN-15", stock: 150, minStock: 40, price: 15 },
  { id: "15", name: "Phone Case", sku: "GEN-CASE-15", stock: 3, minStock: 20, price: 29 },
];

const getStockStatus = (stock: number, minStock: number) => {
  if (stock === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800", icon: AlertTriangle };
  if (stock < minStock) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle };
  return { label: "In Stock", color: "bg-green-100 text-green-800", icon: CheckCircle };
};

export default function StockCheckPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = inventory.filter((i) => i.stock < i.minStock && i.stock > 0).length;
  const outOfStockCount = inventory.filter((i) => i.stock === 0).length;
  const inStockCount = inventory.filter((i) => i.stock >= i.minStock).length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b bg-black px-4 text-white">
        <div className="flex items-center gap-4">
          <Link href="/pos">
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to POS
            </Button>
          </Link>
        </div>
        <h1 className="font-semibold">Stock Check</h1>
        <Link href="/pos">
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
            <Home className="h-4 w-4" />
          </Button>
        </Link>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 mx-auto mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{inStockCount}</p>
              <p className="text-sm text-gray-500">In Stock</p>
            </CardContent>
          </Card>
          <Card className={lowStockCount > 0 ? "border-yellow-300" : ""}>
            <CardContent className="p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 mx-auto mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
              <p className="text-sm text-gray-500">Low Stock</p>
            </CardContent>
          </Card>
          <Card className={outOfStockCount > 0 ? "border-red-300" : ""}>
            <CardContent className="p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 mx-auto mb-2">
                <Package className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
              <p className="text-sm text-gray-500">Out of Stock</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by product name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Inventory List */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory ({filteredInventory.length} items)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredInventory.map((item) => {
                const status = getStockStatus(item.stock, item.minStock);
                const StatusIcon = status.icon;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      item.stock === 0
                        ? "bg-red-50 border-red-200"
                        : item.stock < item.minStock
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-2xl">
                      📦
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.name}</h3>
                      <p className="text-sm text-gray-500 font-mono">{item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${item.price}</p>
                    </div>
                    <div className="text-center min-w-[80px]">
                      <p className={`text-2xl font-bold ${
                        item.stock === 0
                          ? "text-red-600"
                          : item.stock < item.minStock
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}>
                        {item.stock}
                      </p>
                      <p className="text-xs text-gray-400">min: {item.minStock}</p>
                    </div>
                    <Badge className={`${status.color} flex items-center gap-1 min-w-[100px] justify-center`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
