"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Product } from "@/lib/api";
import { useAuth } from "./auth-context";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
};

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_PREFIX = "shopping_cart";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getCartStorageKeyByEmail = (email: string | null): string => {
  if (!email) return "";
  return `${CART_STORAGE_PREFIX}_email_${normalizeEmail(email)}`;
};

const STOCK_FIELDS = [
  "stock",
  "stockQuantity",
  "quantity",
  "availableStock",
  "inventory",
] as const;

const getProductStockLimit = (product: Product): number | null => {
  const source = product as unknown as Record<string, unknown>;

  for (const field of STOCK_FIELDS) {
    const value = source[field];
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      return Math.floor(value);
    }
  }

  return null;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loadedForStorageKey, setLoadedForStorageKey] = useState<string | null>(null);

  // Load cart from localStorage when user changes
  useEffect(() => {
    const email = user?.email ?? null;
    const primaryStorageKey = getCartStorageKeyByEmail(email);

    try {
      if (primaryStorageKey) {
        const storedPrimary = localStorage.getItem(primaryStorageKey);

        if (storedPrimary) {
          const parsed = JSON.parse(storedPrimary) as CartItem[];
          setItems(parsed);
        } else {
          setItems([]); // Empty cart for new user
        }
      } else {
        setItems([]); // No user logged in, clear cart
      }
      setLoadedForStorageKey(primaryStorageKey || null);
    } catch {
      // Ignore parse errors
      setItems([]);
      setLoadedForStorageKey(primaryStorageKey || null);
    }
  }, [user?.email]);

  // Save cart only after cart data has been loaded for the current user
  useEffect(() => {
    const storageKey = getCartStorageKeyByEmail(user?.email ?? null);
    if (!storageKey || loadedForStorageKey !== storageKey) {
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, user?.email, loadedForStorageKey]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    const normalizedRequestedQuantity = Math.max(1, Math.floor(quantity));

    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);

      if (existing) {
        const stockLimit =
          getProductStockLimit(existing.product) ?? getProductStockLimit(product);
        const nextQuantity =
          stockLimit === null
            ? existing.quantity + normalizedRequestedQuantity
            : Math.min(existing.quantity + normalizedRequestedQuantity, stockLimit);

        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: nextQuantity }
            : item
        );
      }

      const stockLimit = getProductStockLimit(product);
      if (stockLimit === 0) {
        return prev;
      }

      const initialQuantity =
        stockLimit === null
          ? normalizedRequestedQuantity
          : Math.min(normalizedRequestedQuantity, stockLimit);

      if (initialQuantity < 1) {
        return prev;
      }

      return [...prev, { product, quantity: initialQuantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const normalizedQuantity = Math.floor(quantity);
    if (normalizedQuantity < 1) return;

    setItems((prev) => {
      const target = prev.find((item) => item.product.id === productId);
      if (!target) {
        return prev;
      }

      const stockLimit = getProductStockLimit(target.product);
      const nextQuantity =
        stockLimit === null
          ? normalizedQuantity
          : Math.min(normalizedQuantity, stockLimit);

      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: nextQuantity } : item
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [items]);

  const getCartCount = useCallback(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
