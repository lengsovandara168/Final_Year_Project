"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchProducts as searchProductsApi } from "@/lib/api";
import type { Product } from "@/lib/api";

export type SearchSuggestion = Pick<
  Product,
  "id" | "name" | "image" | "price"
> & {
  brandName?: string;
};

const isProductAvailable = (product: Product) =>
  typeof product.availableStock === "number"
    ? product.availableStock > 0
    : Boolean(product.inStock);

export function useProductSearch(accessToken: string) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(
    async (query: string) => {
      const normalizedQuery = query.trim().toLowerCase();

      if (!normalizedQuery) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Use your existing searchProducts API
        const response = await searchProductsApi(accessToken, query);
        const products = response.data || [];
        const availableProducts = products.filter(isProductAvailable);

        // Some backends return broad results for unmatched text,
        // so enforce client-side name matching.
        const matchedProducts = availableProducts.filter((product) =>
          product.name.toLowerCase().includes(normalizedQuery),
        );

        // Convert to suggestions format (limit to 10)
        const formatted = matchedProducts.slice(0, 10).map((product) => ({
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          brandName: extractBrandName(product.name),
        }));

        setSuggestions(formatted);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken],
  );

  // Debounce the search to prevent excessive API calls (300ms delay)
  const search = useCallback(
    (query: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);
    },
    [fetchSuggestions],
  );

  const clear = useCallback(() => {
    setSuggestions([]);
    setError(null);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    search,
    clear,
  };
}

/**
 * Extract brand name from product name
 * Assumes brand name is the first word(s) before the model
 */
function extractBrandName(productName: string): string {
  // Common brand patterns
  const brands = [
    "Apple",
    "Samsung",
    "Xiaomi",
    "Google",
    "Motorola",
    "OnePlus",
    "Oppo",
    "Vivo",
    "Sony",
    "Nothing",
    "Redmi",
    "Pixel",
    "Galaxy",
    "iPhone",
    "iPad",
  ];

  for (const brand of brands) {
    if (productName.toLowerCase().startsWith(brand.toLowerCase())) {
      return brand;
    }
  }

  // Fallback: return first word
  return productName.split(/\s+/)[0] || productName;
}
