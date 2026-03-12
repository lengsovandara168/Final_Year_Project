"use client";

import { useEffect, useState } from "react";
import { CheckCircle, ShoppingCart, X } from "lucide-react";

export type CartToastData = {
  productName: string;
  productImage?: string;
  quantity: number;
} | null;

type CartToastProps = {
  data: CartToastData;
  onClose: () => void;
};

export function CartToast({ data, onClose }: CartToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (data) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [data, onClose]);

  if (!data) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-[100] transition-all duration-300 ${
        isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-full"
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg border p-4 max-w-sm flex items-start gap-3">
        {/* Product Image or Icon */}
        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
          {data.productImage ? (
            <img
              src={data.productImage}
              alt={data.productName}
              className="w-full h-full object-cover"
            />
          ) : (
            <ShoppingCart className="h-6 w-6 text-gray-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Added to Cart</span>
          </div>
          <p className="text-sm text-gray-800 truncate">{data.productName}</p>
          <p className="text-xs text-gray-500">Quantity: {data.quantity}</p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
