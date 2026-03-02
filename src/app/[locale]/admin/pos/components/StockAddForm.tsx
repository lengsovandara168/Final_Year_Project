"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { type StockAdjustmentType } from "@/lib/api/pos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StockAddFormProps {
  isLoading: boolean;
  onSubmitAction: (data: {
    productId: string;
    quantity: number;
    adjustmentType: StockAdjustmentType;
    reason?: string;
    notes?: string;
  }) => void;
  products: Array<{ id: string; name: string; brand: string }>;
}

const ADJUSTMENT_TYPES: { value: StockAdjustmentType; label: string }[] = [
  { value: "addition", label: "Add Stock" },
  { value: "damage", label: "Damaged" },
  { value: "loss", label: "Loss/Missing" },
  { value: "return", label: "Return" },
  { value: "adjustment", label: "Adjustment" },
];

export function StockAddForm({
  isLoading,
  onSubmitAction,
  products,
}: StockAddFormProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(0);
  const [adjustmentType, setAdjustmentType] = useState<StockAdjustmentType>("addition");
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct || quantity <= 0) {
      return;
    }

    onSubmitAction({
      productId: selectedProduct,
      quantity,
      adjustmentType,
      reason: reason || undefined,
      notes: notes || undefined,
    });

    // Reset form
    setSelectedProduct("");
    setQuantity(0);
    setAdjustmentType("addition");
    setReason("");
    setNotes("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Select Product
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Choose product...</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.brand} - {product.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Quantity</label>
          <Input
            type="number"
            min="1"
            value={quantity || ""}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            placeholder="Enter quantity"
            className="h-10"
          />
        </div>

        {/* Adjustment Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Type</label>
          <select
            value={adjustmentType}
            onChange={(e) => setAdjustmentType(e.target.value as StockAdjustmentType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {ADJUSTMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reason Input (optional) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Reason (Optional)</label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Supplier delivery"
            className="h-10"
          />
        </div>
      </div>

      {/* Notes Textarea */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional details about this adjustment..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading || !selectedProduct || quantity <= 0}
        className="w-full h-11 bg-blue-600 hover:bg-blue-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Add Stock Adjustment
          </>
        )}
      </Button>
    </form>
  );
}
