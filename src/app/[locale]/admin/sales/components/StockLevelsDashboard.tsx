"use client";

import { useMemo, useState } from "react";
import type { StockLevel } from "@/lib/api/pos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";

const statusColors: Record<string, string> = {
  "in-stock": "bg-green-100 text-green-800 border-green-200",
  "low-stock": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "out-of-stock": "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<string, string> = {
  "in-stock": "In Stock",
  "low-stock": "Low Stock",
  "out-of-stock": "Out of Stock",
};

type StatusFilter = "all" | "in-stock" | "low-stock" | "out-of-stock";

interface StockLevelsDashboardProps {
  levels: StockLevel[];
}

export function StockLevelsDashboard({ levels }: StockLevelsDashboardProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const stats = useMemo(
    () => ({
      total: levels.length,
      inStock: levels.filter((l) => l.status === "in-stock").length,
      lowStock: levels.filter((l) => l.status === "low-stock").length,
      outOfStock: levels.filter((l) => l.status === "out-of-stock").length,
    }),
    [levels],
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return levels.filter((l) => {
      const matchesQuery =
        !q ||
        l.productName.toLowerCase().includes(q) ||
        l.brand.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || l.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [levels, query, statusFilter]);

  if (levels.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p className="text-sm">No stock data available yet.</p>
      </div>
    );
  }

  const filterButtons: { label: string; value: StatusFilter }[] = [
    { label: `All (${stats.total})`, value: "all" },
    { label: `In Stock (${stats.inStock})`, value: "in-stock" },
    { label: `Low Stock (${stats.lowStock})`, value: "low-stock" },
    { label: `Out of Stock (${stats.outOfStock})`, value: "out-of-stock" },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Products</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-xs font-medium text-green-600">In Stock</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-2xl font-bold text-green-700">{stats.inStock}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-xs font-medium text-yellow-600">Low Stock</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-2xl font-bold text-yellow-700">{stats.lowStock}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-xs font-medium text-red-600">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-2xl font-bold text-red-700">{stats.outOfStock}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by product, brand or category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filterButtons.map((btn) => (
            <Button
              key={btn.value}
              variant={statusFilter === btn.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(btn.value)}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Min</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No results match your search or filter.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((level) => {
                  const d = new Date(level.lastUpdated);
                  return (
                    <TableRow key={level.id}>
                      <TableCell className="font-medium">{level.productName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{level.brand}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">{level.category}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {level.currentQuantity}
                      </TableCell>
                      <TableCell className="text-right">{level.minQuantity ?? "—"}</TableCell>
                      <TableCell>
                        <Badge
                          className={statusColors[level.status] ?? "bg-gray-100 text-gray-800"}
                        >
                          {statusLabels[level.status] ?? level.status.replace(/-/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <span>{d.toLocaleDateString()}</span>
                        <span className="ml-1 text-xs">{d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
