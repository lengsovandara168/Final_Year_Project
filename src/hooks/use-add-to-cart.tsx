"use client";

import { useCallback } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/contexts/cart-context";
import type { Product } from "@/lib/api";

export function useAddToCartWithToast() {
  const { addToCart } = useCart();

  const addToCartWithToast = useCallback(
    (product: Product, quantity = 1) => {
      addToCart(product, quantity);

      toast.success("Added to cart", {
        description: (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ShoppingCart className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate text-gray-900">{product.name}</p>
              <p className="text-xs text-gray-500">
                Added successfully 
                Qty: {quantity}
              </p>
            </div>
          </div>
        ),
      });
    },
    [addToCart]
  );

  return addToCartWithToast;
}
