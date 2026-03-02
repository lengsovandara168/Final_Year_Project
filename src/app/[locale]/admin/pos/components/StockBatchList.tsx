"use client";

import { Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BatchItem {
  id: string;
  brand: string;
  model: string;
  quantity: number;
}

interface StockBatchListProps {
  items: BatchItem[];
  onRemoveAction: (id: string) => void;
  onEditAction: (id: string) => void;
}

export function StockBatchList({
  items,
  onRemoveAction,
  onEditAction,
}: StockBatchListProps) {
  if (items.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            No items in batch. Add products to get started.
          </p>
        </div>
      </Card>
    );
  }

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Pending Items</h3>
          <Badge variant="secondary">{items.length} products</Badge>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Total quantity: {totalQuantity}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Brand
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Model
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="outline">{item.brand}</Badge>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">{item.model}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                    {item.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                  <Button
                    onClick={() => onEditAction(item.id)}
                    variant="outline"
                    size="sm"
                    className="h-8"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => onRemoveAction(item.id)}
                    variant="destructive"
                    size="sm"
                    className="h-8"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
