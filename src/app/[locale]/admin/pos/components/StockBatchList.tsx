"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface BatchItem {
  productId: string;
  category: "phones" | "tablets" | "accessories";
  brand: string;
  model: string;
  quantity: number;
  imei?: string;
}

interface StockBatchListProps {
  items: BatchItem[];
  onRemoveAction: (itemKey: string) => void;
  onUpdateQuantityAction: (itemKey: string, quantity: number) => void;
}

export function StockBatchList({
  items,
  onRemoveAction,
  onUpdateQuantityAction,
}: StockBatchListProps) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p className="text-sm">
          No items in batch yet. Scan a product to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>IMEI</TableHead>
            <TableHead>Product ID</TableHead>
            <TableHead className="w-28">Qty</TableHead>
            <TableHead className="text-right">Remove</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const itemKey = item.imei ? `imei:${item.imei}` : `pid:${item.productId}`;
            return (
            <TableRow key={itemKey}>
              <TableCell>
                <Badge variant="secondary" className="capitalize">
                  {item.category}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{item.brand}</Badge>
              </TableCell>
              <TableCell className="font-medium">{item.model}</TableCell>
              <TableCell className="font-mono text-xs">
                {item.imei ?? "—"}
              </TableCell>
              <TableCell className="font-mono text-xs">{item.productId}</TableCell>
              <TableCell>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  disabled={Boolean(item.imei)}
                  onChange={(e) =>
                    onUpdateQuantityAction(
                      itemKey,
                      Math.max(1, parseInt(e.target.value) || 1),
                    )
                  }
                  className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveAction(itemKey)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          );})}
        </TableBody>
      </Table>
    </div>
  );
}
