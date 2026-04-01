"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getSessionSnapshot } from "@/lib/auth-session";
import { getCategoryBoard, getProducts, type Product } from "@/lib/api";
import { DEFAULT_BRANDS_BY_CATEGORY } from "@/lib/shop.constants";
import type { BrandsByCategory } from "@/lib/shop.types";
import {
  deduplicateProductTemplates,
  mapBrandsByCategory,
} from "@/lib/shop.utils";

type UseShopDataResult = {
  products: Product[];
  popularProducts: Product[];
  bestSellers: Product[];
  brandsByCategory: BrandsByCategory;
};

export function useShopData(): UseShopDataResult {
  const accessToken = getSessionSnapshot().accessToken;

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["shop-products", "all"],
    enabled: Boolean(accessToken),
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      if (!accessToken) return [];
      const productsResponse = await getProducts(accessToken);
      return deduplicateProductTemplates(productsResponse.data || []);
    },
  });

  const { data: brandsByCategory = DEFAULT_BRANDS_BY_CATEGORY } =
    useQuery<BrandsByCategory>({
      queryKey: ["shop-categories-board"],
      enabled: Boolean(accessToken),
      staleTime: 1000 * 60 * 5,
      queryFn: async () => {
        if (!accessToken) return DEFAULT_BRANDS_BY_CATEGORY;
        const board = await getCategoryBoard(accessToken);
        return mapBrandsByCategory(board.data);
      },
    });

  const popularProducts = useMemo(
    () => products.filter((item) => item.isPopular && item.inStock),
    [products],
  );

  const bestSellers = useMemo(
    () => products.filter((item) => item.isBestSeller && item.inStock),
    [products],
  );

  return {
    products,
    popularProducts,
    bestSellers,
    brandsByCategory,
  };
}
