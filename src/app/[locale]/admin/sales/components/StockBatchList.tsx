"use client";

import { useMemo } from "react";
import { Package, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const categoryColors: Record<string, string> = {
  phones: "bg-blue-100 text-blue-800 border-blue-200",
  tablets: "bg-purple-100 text-purple-800 border-purple-200",
  accessories: "bg-orange-100 text-orange-800 border-orange-200",
};

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
  const totalUnits = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-10 text-center text-muted-foreground">
        <Package className="mx-auto mb-2 h-8 w-8 opacity-40" />
        <p className="text-sm">No items in batch yet. Scan a product to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary banner */}
      <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2 text-sm">
        <span className="font-medium text-muted-foreground">
          {items.length} line{items.length !== 1 ? "s" : ""}
        </span>
        <span className="font-semibold">
          {totalUnits} unit{totalUnits !== 1 ? "s" : ""} total
        </span>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
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
                      <Badge
                        className={
                          categoryColors[item.category] ??
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.brand}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.model}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.imei ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.productId}
                    </TableCell>
                    <TableCell>
                      <Input
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
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveAction(itemKey)}
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
