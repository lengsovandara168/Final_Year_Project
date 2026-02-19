"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { Product, CartItem } from "@/lib/shop-data";

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

type ShopContextType = {
  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  
  // Wishlist
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
  wishlistCount: number;
  
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // UI State
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: "login" | "register";
  setAuthModalMode: (mode: "login" | "register") => void;
  pendingAction: (() => void) | null;
  setPendingAction: (action: (() => void) | null) => void;
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("shop-cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    const savedUser = localStorage.getItem("shop-user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      // Load user-specific wishlist
      const savedWishlist = localStorage.getItem(`shop-wishlist-${userData.id}`);
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("shop-cart", JSON.stringify(cart));
  }, [cart]);

  // Save wishlist to localStorage when it changes (user-specific)
  useEffect(() => {
    if (user) {
      localStorage.setItem(`shop-wishlist-${user.id}`, JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Wishlist functions
  const addToWishlist = useCallback((product: Product) => {
    setWishlist((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: number) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  }, []);

  const isInWishlist = useCallback((productId: number) => {
    return wishlist.some((item) => item.id === productId);
  }, [wishlist]);

  const wishlistCount = wishlist.length;

  const cartTotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Mock login function - replace with real API call
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock successful login
    if (email && password) {
      const mockUser: User = {
        id: "1",
        name: email.split("@")[0],
        email: email,
      };
      setUser(mockUser);
      localStorage.setItem("shop-user", JSON.stringify(mockUser));
      
      // Load user-specific wishlist
      const savedWishlist = localStorage.getItem(`shop-wishlist-${mockUser.id}`);
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
      
      setIsAuthModalOpen(false);
      
      // Execute pending action if exists
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
      
      return true;
    }
    return false;
  }, [pendingAction]);

  // Mock register function - replace with real API call
  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock successful registration
    if (name && email && password) {
      const mockUser: User = {
        id: "1",
        name: name,
        email: email,
      };
      setUser(mockUser);
      localStorage.setItem("shop-user", JSON.stringify(mockUser));
      
      // New user starts with empty wishlist
      setWishlist([]);
      setIsAuthModalOpen(false);
      
      // Execute pending action if exists
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
      
      return true;
    }
    return false;
  }, [pendingAction]);

  const logout = useCallback(() => {
    setUser(null);
    setWishlist([]);
    localStorage.removeItem("shop-user");
  }, []);

  return (
    <ShopContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount,
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        isCartOpen,
        setIsCartOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        pendingAction,
        setPendingAction,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
