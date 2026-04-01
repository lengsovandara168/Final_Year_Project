import type { ReactNode } from "react";
import type { Product } from "@/lib/api";

export type ShopProduct = Product;

export enum ShopCategoryView {
  ALL = "all",
  PHONE = "phone",
  TABLET = "tablet",
  ACCESSORIES = "accessories",
  OFFER = "offer",
}

export type ShopCategoryId = ShopCategoryView;

export interface Category {
  id: ShopCategoryId;
  name: string;
  icon: ReactNode;
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
}

export interface NewsItem {
  id: number;
  title: string;
  description: string;
  image?: string;
  link?: string;
  bgColor?: string;
}

export type ShopNewsTemplate = {
  id: number;
  titleKey: string;
  descriptionKey: string;
  image?: string;
  link?: string;
  bgColor?: string;
};

export type SortOption =
  | "price-low"
  | "price-high"
  | "popular"
  | "rating"
  | "newest";

export type BoardCategoryKey = "phones" | "tablets" | "accessories";

export type BrandLibraryItem = {
  name: string;
  domain: string;
};

export type BrandsByCategory = Record<
  "phone" | "tablet" | "accessories",
  Brand[]
>;
