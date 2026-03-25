import React from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
  image?: string;
}

interface CartItemListProps {
  items: CartItem[];
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  lockQuantity?: boolean;
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
  lockQuantity = false,
  onUndoRemove,
  emptyText = "Cart is empty",
  removeText = "Remove",
  decreaseLabel = "Decrease quantity",
  quantityLabel = "Quantity",
  increaseLabel = "Increase quantity",
  removeLabel = "Remove item",
}) => {
  return (
    <div className="mb-4 overflow-hidden rounded-lg border">
      {items.length === 0 ? (
        <div className="p-6 text-center text-gray-400">{emptyText}</div>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="grid gap-3 border-t p-3 first:border-t-0 md:grid-cols-[minmax(0,1fr)_auto_auto]"
          >
            <div className="min-w-0">
              <div className="truncate font-medium">{item.name}</div>
              <div className="truncate text-xs text-gray-500">{item.barcode}</div>
            </div>
            <div className="flex items-center gap-1 justify-self-start md:justify-self-center">
              <button
                className="h-9 w-9 rounded border"
                onClick={() =>
                  onQuantityChange(item.id, Math.max(1, item.quantity - 1))
                }
                aria-label={decreaseLabel}
                disabled={lockQuantity || item.quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                min={1}
                className="h-9 w-14 rounded border text-center"
                value={item.quantity}
                onChange={(e) =>
                  onQuantityChange(item.id, Math.max(1, Number(e.target.value)))
                }
                aria-label={quantityLabel}
                disabled={lockQuantity}
              />
              <button
                className="h-9 w-9 rounded border"
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                aria-label={increaseLabel}
                disabled={lockQuantity}
              >
                +
              </button>
            </div>
            <div className="flex items-center justify-between gap-3 md:min-w-[132px] md:justify-self-end">
              <div className="text-right font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
              <button
                className="text-sm text-red-500 hover:underline"
                onClick={() => onRemove(item.id)}
                aria-label={removeLabel}
              >
                {removeText}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
