"use client";

import { useMemo, useState } from "react";
import type { StockHistory } from "@/lib/api/pos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const adjustmentColors: Record<string, string> = {
  addition: "bg-green-100 text-green-800",
  damage: "bg-red-100 text-red-800",
  loss: "bg-orange-100 text-orange-800",
  return: "bg-blue-100 text-blue-800",
  adjustment: "bg-gray-100 text-gray-800",
};

interface StockHistoryTableProps {
  history: StockHistory[];
}

const FILTERS = ["all", "addition", "return", "damage", "loss", "adjustment"] as const;
type FilterType = (typeof FILTERS)[number];

export function StockHistoryTable({ history }: StockHistoryTableProps) {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");

  const filteredHistory = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return history.filter((item) => {
      const matchesType =
        filterType === "all" ? true : item.adjustmentType === filterType;

      if (!matchesType) return false;
      if (!normalizedQuery) return true;

      return (
        item.productId.toLowerCase().includes(normalizedQuery) ||
        (item.staffName ?? "").toLowerCase().includes(normalizedQuery) ||
        item.staffId.toLowerCase().includes(normalizedQuery) ||
        (item.reason ?? "").toLowerCase().includes(normalizedQuery)
      );
    });
  }, [filterType, history, query]);

  const totalChanges = filteredHistory.length;
  const inboundCount = filteredHistory.filter((i) => i.quantityChange > 0).length;
  const outboundCount = filteredHistory.filter((i) => i.quantityChange < 0).length;

  if (history.length === 0) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        <p className="text-sm">No history yet. Stock changes will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Changes</p>
            <p className="text-2xl font-semibold">{totalChanges}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Inbound</p>
            <p className="text-2xl font-semibold text-green-600">{inboundCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Outbound</p>
            <p className="text-2xl font-semibold text-red-600">{outboundCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by product, staff, or reason"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((type) => (
            <Button
              key={type}
              type="button"
              size="sm"
              variant={filterType === type ? "default" : "outline"}
              onClick={() => setFilterType(type)}
              className="capitalize"
            >
              {type === "all" ? "All" : type}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Previous</TableHead>
              <TableHead>New</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  No matching records.
                </TableCell>
              </TableRow>
            ) : (
              filteredHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">Product</p>
                      <p className="font-mono text-xs text-muted-foreground">{item.productId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        item.quantityChange > 0
                          ? "font-medium text-green-600"
                          : "font-medium text-red-600"
                      }
                    >
                      {item.quantityChange > 0
                        ? `+${item.quantityChange}`
                        : item.quantityChange}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        adjustmentColors[item.adjustmentType] ??
                        "bg-gray-100 text-gray-800"
                      }
                    >
                      {item.adjustmentType}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.previousQuantity}</TableCell>
                  <TableCell>{item.newQuantity}</TableCell>
                  <TableCell>{item.staffName ?? item.staffId}</TableCell>
                  <TableCell className="max-w-45 truncate">{item.reason ?? "—"}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{new Date(item.timestamp).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
