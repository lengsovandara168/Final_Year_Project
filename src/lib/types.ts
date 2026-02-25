// Shared type definitions for the application

/**
 * Product interface - used for both product listing and product detail pages
 * ID format: brand#category-number (e.g., "apple#phone-1", "samsung#tablet-2")
 * This format allows efficient database filtering by brand+category
 */
export interface Product {
  id: string; // format: brand#category-number
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image?: string;
  category: "phone" | "tablet" | "accessories" | "offer";
  subcategory: string; // brand name for filtering
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isPopular?: boolean;
  isBestSeller?: boolean;
  description?: string;
  specifications?: { label: string; value: string }[]; // Only loaded for product detail page
}

/**
 * Brand interface for category filtering
 */
export interface Brand {
  id: string;
  name: string;
  logo?: string;
}

/**
 * News/Banner item for carousel
 */
export interface NewsItem {
  id: number;
  title: string;
  description: string;
  image?: string;
  link?: string;
  bgColor?: string;
}

/**
 * Cart item
 */
export interface CartItem {
  productId: string;
  quantity: number;
}
