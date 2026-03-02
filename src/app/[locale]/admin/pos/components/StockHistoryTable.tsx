"use client";

import { type StockHistory } from "@/lib/api/pos";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface StockHistoryTableProps {
  history: StockHistory[];
  isLoading?: boolean;
}

const getAdjustmentColor = (type: string) => {
  switch (type) {
    case "addition":
      return "bg-green-100 text-green-800";
    case "damage":
      return "bg-red-100 text-red-800";
    case "loss":
      return "bg-orange-100 text-orange-800";
    case "return":
      return "bg-blue-100 text-blue-800";
    case "adjustment":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getAdjustmentLabel = (type: string) => {
  switch (type) {
    case "addition":
      return "Addition";
    case "damage":
      return "Damaged";
    case "loss":
      return "Loss";
    case "return":
      return "Return";
    case "adjustment":
      return "Adjustment";
    default:
      return type;
  }
};

export function StockHistoryTable({
  history,
  isLoading,
}: StockHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading history...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No stock adjustments yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Quantity Change</TableHead>
            <TableHead className="text-right">Previous Qty</TableHead>
            <TableHead className="text-right">New Qty</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="text-sm">
                {new Date(item.timestamp).toLocaleString()}
              </TableCell>
              <TableCell className="text-sm font-medium">
                {item.productName}
              </TableCell>
              <TableCell className="text-sm">{item.brand}</TableCell>
              <TableCell>
                <Badge className={getAdjustmentColor(item.adjustmentType)}>
                  {getAdjustmentLabel(item.adjustmentType)}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold">
                <span
                  className={
                    item.quantityChange > 0
                      ? "text-green-600"
                      : item.quantityChange < 0
                        ? "text-red-600"
                        : "text-gray-600"
                  }
                >
                  {item.quantityChange > 0 ? "+" : ""}
                  {item.quantityChange}
                </span>
              </TableCell>
              <TableCell className="text-right">{item.previousQuantity}</TableCell>
              <TableCell className="text-right font-medium">
                {item.newQuantity}
              </TableCell>
              <TableCell className="text-sm">{item.reason || "-"}</TableCell>
              <TableCell className="text-sm">
                {item.staffName || item.staffId}
              </TableCell>
              <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                {item.notes || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
