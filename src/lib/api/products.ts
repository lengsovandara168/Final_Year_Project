// f:\AUPP\2026\FYP\FYP_Project\src\lib\api\products.ts

import { apiFetch } from "./client";

export type ProductSpecification = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image?: string;
  subcategory: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isPopular?: boolean;
  isBestSeller?: boolean;
  description?: string;
  specifications?: ProductSpecification[];
};

export type GetProductsResponse = {
  ok: boolean;
  total: number;
  data: Product[];
};

export type GetProductResponse = {
  ok: boolean;
  data: Product;
};

export async function getProducts(
  accessToken: string,
  subcategorySlug?: string,
) {
  const params = subcategorySlug
    ? `?subcategory=${encodeURIComponent(subcategorySlug)}`
    : "";
  return apiFetch<GetProductsResponse>(`/v1/products${params}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function getProductById(accessToken: string, productId: string) {
  return apiFetch<GetProductResponse>(`/v1/products/${productId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export type DeleteProductResponse = {
  ok: boolean;
  message: string;
};

export async function deleteProduct(
  accessToken: string,
  productId: string,
): Promise<DeleteProductResponse> {
  return apiFetch<DeleteProductResponse>(`/v1/admin/products/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
