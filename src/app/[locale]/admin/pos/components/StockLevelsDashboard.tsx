"use client";

import type { StockLevel } from "@/lib/api/pos";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusColors: Record<string, string> = {
  "in-stock": "bg-green-100 text-green-800",
  "low-stock": "bg-yellow-100 text-yellow-800",
  "out-of-stock": "bg-red-100 text-red-800",
};

interface StockLevelsDashboardProps {
  levels: StockLevel[];
}

export function StockLevelsDashboard({ levels }: StockLevelsDashboardProps) {
  if (levels.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p className="text-sm">No stock data available yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Min</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {levels.map((level) => (
            <TableRow key={level.id}>
              <TableCell className="font-medium">{level.productName}</TableCell>
              <TableCell>{level.brand}</TableCell>
              <TableCell>{level.category}</TableCell>
              <TableCell className="font-medium">
                {level.currentQuantity}
              </TableCell>
              <TableCell>{level.minQuantity ?? "—"}</TableCell>
              <TableCell>
                <Badge
                  className={
                    statusColors[level.status] ?? "bg-gray-100 text-gray-800"
                  }
                >
                  {level.status.replace(/-/g, " ")}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(level.lastUpdated).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
