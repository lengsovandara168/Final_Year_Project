"use client";

import type { StockHistory } from "@/lib/api/pos";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export function StockHistoryTable({ history }: StockHistoryTableProps) {
  if (history.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p className="text-sm">No history yet. Stock changes will appear here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product ID</TableHead>
            <TableHead>Change</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Previous</TableHead>
            <TableHead>New</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-mono text-xs">{item.productId}</TableCell>
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
              <TableCell>
                {new Date(item.timestamp).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
