"use client";

import { type StockLevel } from "@/lib/api/pos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Package } from "lucide-react";

interface StockLevelsDashboardProps {
  levels: StockLevel[];
  isLoading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "in-stock":
      return "bg-green-100 text-green-800";
    case "low-stock":
      return "bg-yellow-100 text-yellow-800";
    case "out-of-stock":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "in-stock":
      return "In Stock";
    case "low-stock":
      return "Low Stock";
    case "out-of-stock":
      return "Out of Stock";
    default:
      return status;
  }
};

export function StockLevelsDashboard({
  levels,
  isLoading,
}: StockLevelsDashboardProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading stock levels...
      </div>
    );
  }

  // Group by category
  const byCategory = levels.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, StockLevel[]>,
  );

  const lowStockCount = levels.filter((l) => l.status === "low-stock").length;
  const outOfStockCount = levels.filter((l) => l.status === "out-of-stock")
    .length;
  const totalProducts = levels.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-sm text-gray-600">Total Products</p>
          </CardContent>
        </Card>
        <Card className={outOfStockCount > 0 ? "border-red-200" : ""}>
          <CardContent className="pt-6">
            <div className={`text-2xl font-bold ${outOfStockCount > 0 ? "text-red-600" : ""}`}>
              {outOfStockCount}
            </div>
            <p className="text-sm text-gray-600">Out of Stock</p>
          </CardContent>
        </Card>
        <Card className={lowStockCount > 0 ? "border-yellow-200" : ""}>
          <CardContent className="pt-6">
            <div className={`text-2xl font-bold ${lowStockCount > 0 ? "text-yellow-600" : ""}`}>
              {lowStockCount}
            </div>
            <p className="text-sm text-gray-600">Low Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {levels.reduce((sum, l) => sum + l.currentQuantity, 0)}
            </div>
            <p className="text-sm text-gray-600">Total Units</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(byCategory).map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg capitalize">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.brand} - {item.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Last updated:{" "}
                        {new Date(item.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {item.currentQuantity} units
                        </div>
                        {item.status === "out-of-stock" && (
                          <div className="text-xs text-red-600">Out</div>
                        )}
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusLabel(item.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {(outOfStockCount > 0 || lowStockCount > 0) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900">Stock Alert</p>
                <p className="text-sm text-amber-700 mt-1">
                  {outOfStockCount > 0 && `${outOfStockCount} product(s) out of stock. `}
                  {lowStockCount > 0 && `${lowStockCount} product(s) have low stock. `}
                  Please add inventory soon.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
