import React from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
}

interface CartItemListProps {
  items: CartItem[];
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onUndoRemove?: (item: CartItem) => void;
  emptyText?: string;
  removeText?: string;
  decreaseLabel?: string;
  quantityLabel?: string;
  increaseLabel?: string;
  removeLabel?: string;
}

export const CartItemList: React.FC<CartItemListProps> = ({
  items,
  onQuantityChange,
  onRemove,
  onUndoRemove,
  emptyText = "Cart is empty",
  removeText = "Remove",
  decreaseLabel = "Decrease quantity",
  quantityLabel = "Quantity",
  increaseLabel = "Increase quantity",
  removeLabel = "Remove item",
}) => {
  return (
    <div className="divide-y border rounded mb-4">
      {items.length === 0 ? (
        <div className="p-4 text-center text-gray-400">{emptyText}</div>
      ) : (
        items.map(item => (
          <div key={item.id} className="flex items-center gap-2 p-2">
            <div className="flex-1">
              <div className="font-medium">{item.name}</div>
              <div className="text-xs text-gray-500">{item.barcode}</div>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="px-2 py-1 border rounded"
                onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                aria-label={decreaseLabel}
              >
                -
              </button>
              <input
                type="number"
                min={1}
                className="w-12 text-center border rounded"
                value={item.quantity}
                onChange={e => onQuantityChange(item.id, Math.max(1, Number(e.target.value)))}
                aria-label={quantityLabel}
              />
              <button
                className="px-2 py-1 border rounded"
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                aria-label={increaseLabel}
              >
                +
              </button>
            </div>
            <div className="w-16 text-right">${(item.price * item.quantity).toFixed(2)}</div>
            <button
              className="ml-2 text-red-500 hover:underline"
              onClick={() => onRemove(item.id)}
              aria-label={removeLabel}
            >
              {removeText}
            </button>
          </div>
        ))
      )}
    </div>
  );
};
