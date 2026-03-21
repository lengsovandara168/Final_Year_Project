"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/api";
import { getSessionSnapshot } from "@/lib/auth-session";

type WishlistContextType = {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => boolean;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
  getWishlistCount: () => number;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

const WISHLIST_STORAGE_KEY = "wishlist_by_user";

type WishlistByUser = Record<string, Product[]>;

function getActiveUserKey() {
  const email = getSessionSnapshot().user?.email?.trim().toLowerCase();
  return email || "guest";
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [itemsByUser, setItemsByUser] = useState<WishlistByUser>({});
  const [activeUserKey, setActiveUserKey] = useState("guest");
  const [isInitialized, setIsInitialized] = useState(false);

  const items = itemsByUser[activeUserKey] ?? [];

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WishlistByUser;
        if (parsed && typeof parsed === "object") {
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

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(itemsByUser));
  }, [itemsByUser, isInitialized]);

  const addToWishlist = useCallback(
    (product: Product) => {
      setItemsByUser((prev) => {
        const current = prev[activeUserKey] ?? [];
        if (current.some((item) => item.id === product.id)) {
          return prev;
        }

        return {
          ...prev,
          [activeUserKey]: [product, ...current],
        };
      });
    },
    [activeUserKey],
  );

  const removeFromWishlist = useCallback(
    (productId: string) => {
      setItemsByUser((prev) => {
        const current = prev[activeUserKey] ?? [];
        return {
          ...prev,
          [activeUserKey]: current.filter((item) => item.id !== productId),
        };
      });
    },
    [activeUserKey],
  );

  const toggleWishlist = useCallback(
    (product: Product) => {
      let nextIsWishlisted = false;

      setItemsByUser((prev) => {
        const current = prev[activeUserKey] ?? [];
        const exists = current.some((item) => item.id === product.id);

        if (exists) {
          nextIsWishlisted = false;
          return {
            ...prev,
            [activeUserKey]: current.filter((item) => item.id !== product.id),
          };
        }

        nextIsWishlisted = true;
        return {
          ...prev,
          [activeUserKey]: [product, ...current],
        };
      });

      return nextIsWishlisted;
    },
    [activeUserKey],
  );

  const isWishlisted = useCallback(
    (productId: string) => items.some((item) => item.id === productId),
    [items],
  );

  const clearWishlist = useCallback(() => {
    setItemsByUser((prev) => ({
      ...prev,
      [activeUserKey]: [],
    }));
  }, [activeUserKey]);

  const getWishlistCount = useCallback(() => items.length, [items]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isWishlisted,
        clearWishlist,
        getWishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
