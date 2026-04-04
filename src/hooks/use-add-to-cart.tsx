"use client";

import { useCallback } from "react";
import { CircleCheck, ShoppingCart, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/contexts/cart-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Product } from "@/lib/api";

export function useAddToCartWithToast() {
  const { addToCart } = useCart();

  const addToCartWithToast = useCallback(
    (product: Product, quantity = 1) => {
      const addedQuantity = addToCart(product, quantity);

      if (addedQuantity < 1) {
        toast.custom(() => (
          <Alert variant="destructive" className="shadow-lg">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Stock limit reached</AlertTitle>
            <AlertDescription>
              You cannot add more of this item than available stock.
            </AlertDescription>
          </Alert>
        ), { position: "top-right" });
        return;
      }

      toast.custom(
        () => (
          <Alert className="w-90 border-green-200 bg-green-50 text-green-900 shadow-lg">
            <CircleCheck className="h-4 w-4 text-green-700" />
            <AlertTitle>Added to cart</AlertTitle>
            <AlertDescription>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ShoppingCart className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    Added successfully Qty: {addedQuantity}
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        ),
        { position: "top-right" },
      );
    },
    [addToCart],
  );

  return addToCartWithToast;
}
