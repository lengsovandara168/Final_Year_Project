"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Product } from "@/lib/api";
import { getSessionSnapshot } from "@/lib/auth-session";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => number;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
};

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = "shopping_cart_by_user";
const LEGACY_CART_STORAGE_KEY = "shopping_cart";

type CartByUser = Record<string, CartItem[]>;

function getActiveUserKey() {
  const email = getSessionSnapshot().user?.email?.trim().toLowerCase();
  return email || "guest";
}

function toSafePositiveInteger(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  if (!Number.isFinite(value)) return null;
  if (value <= 0) return 0;
  return Math.floor(value);
}

function getProductStockLimit(product: Product) {
  const explicitLimit =
    toSafePositiveInteger(product.availableStock) ??
    toSafePositiveInteger(product.stockQuantity) ??
    toSafePositiveInteger(product.stock) ??
    toSafePositiveInteger(product.quantity);

  if (explicitLimit !== null) {
    return explicitLimit;
  }

  return product.inStock ? Number.POSITIVE_INFINITY : 0;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [itemsByUser, setItemsByUser] = useState<CartByUser>({});
  const [activeUserKey, setActiveUserKey] = useState("guest");
  const [isInitialized, setIsInitialized] = useState(false);

  const items = itemsByUser[activeUserKey] ?? [];

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(CART_STORAGE_KEY) ??
        localStorage.getItem(LEGACY_CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartByUser | CartItem[];
        if (Array.isArray(parsed)) {
          setItemsByUser({ guest: parsed });
        } else if (parsed && typeof parsed === "object") {
          setItemsByUser(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }
    setActiveUserKey(getActiveUserKey());
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const syncActiveUser = () => {
      setActiveUserKey(getActiveUserKey());
    };

    syncActiveUser();
    window.addEventListener("focus", syncActiveUser);
    document.addEventListener("visibilitychange", syncActiveUser);
    const intervalId = window.setInterval(syncActiveUser, 1000);

    return () => {
      window.removeEventListener("focus", syncActiveUser);
      document.removeEventListener("visibilitychange", syncActiveUser);
      window.clearInterval(intervalId);
    };
  }, [isInitialized]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(itemsByUser));
    }
  }, [itemsByUser, isInitialized]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    if (quantity < 1) return 0;

    const stockLimit = getProductStockLimit(product);
    if (stockLimit < 1) return 0;

    let addedQuantity = 0;

    setItemsByUser((prev) => {
      const current = prev[activeUserKey] ?? [];
      const existing = current.find((item) => item.product.id === product.id);
      const currentQuantity = existing?.quantity ?? 0;
      const nextQuantity = Math.min(currentQuantity + quantity, stockLimit);
      addedQuantity = Math.max(0, nextQuantity - currentQuantity);

      if (addedQuantity === 0) {
        return prev;
      }

      const nextItems = existing
        ? current.map((item) =>
            item.product.id === product.id
              ? { ...item, product: { ...item.product, ...product }, quantity: nextQuantity }
              : item
          )
        : [...current, { product, quantity: nextQuantity }];

      return {
        ...prev,
        [activeUserKey]: nextItems,
      };
    });

    return addedQuantity;
  }, [activeUserKey]);

  const removeFromCart = useCallback((productId: string) => {
    setItemsByUser((prev) => {
      const current = prev[activeUserKey] ?? [];
      return {
        ...prev,
        [activeUserKey]: current.filter((item) => item.product.id !== productId),
      };
    });
  }, [activeUserKey]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return; // Prevent quantity from going below 1
    setItemsByUser((prev) => {
      const current = prev[activeUserKey] ?? [];
      const nextItems = current.map((item) => {
        if (item.product.id !== productId) {
          return item;
        }

        const limit = getProductStockLimit(item.product);
        const nextQuantity = Math.max(1, Math.min(quantity, limit));
        return { ...item, quantity: nextQuantity };
      });

      return {
        ...prev,
        [activeUserKey]: nextItems,
      };
    });
  }, [activeUserKey]);

  const clearCart = useCallback(() => {
    setItemsByUser((prev) => ({
      ...prev,
      [activeUserKey]: [],
    }));
  }, [activeUserKey]);

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
