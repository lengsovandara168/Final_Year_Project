// f:\AUPP\2026\FYP\FYP_Project\src\lib\api\products.ts

import { apiFetch } from "./client";

export type ProductSpecification = {
  key: string;
  value: string;
};

export type Product = {
  id: string;
  templateId?: string;
  name: string;
  imei?: string | null;
  price: number;
  originalPrice?: number;
  image?: string;
  subcategoryId: string;
  storage?: string | null;
  color?: string;
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

export type UploadedProductImage = {
  key: string;
  url?: string;
  contentType: string;
  size: number;
};

export type UploadProductImageResponse = {
  ok: boolean;
  data: UploadedProductImage;
};

export async function uploadProductImage(file: File, accessToken: string) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<UploadProductImageResponse>("/v1/add-product/images/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });
}

export type CreateProductRequest = {
  templateId: string;
  imei?: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  isPopular?: boolean;
  isBestSeller?: boolean;
};

export type CreateProductResponse = {
  ok: boolean;
  data: Product;
};

export async function createProduct(
  payload: CreateProductRequest,
  accessToken: string,
) {
  return apiFetch<CreateProductResponse>("/v1/add-product", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export type ProductTemplate = {
  id: string;
  name: string;
  storage?: string | null;
  color: string;
  image?: string;
  description?: string;
  subcategoryId: string;
  subcategoryName?: string;
  parentCategory: "phones" | "tablets" | "accessories";
  isActive: boolean;
  specifications?: ProductSpecification[];
};

export type GetProductTemplatesResponse = {
  ok: boolean;
  data: ProductTemplate[];
};

export async function getProductTemplates(accessToken: string) {
  return apiFetch<GetProductTemplatesResponse>("/v1/add-product/templates", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export type CreateProductTemplateRequest = {
  parentCategory: "phones" | "tablets" | "accessories";
  subcategoryName: string;
  subcategorySlug?: string;
  name: string;
  storage?: string;
  color: string;
  image?: string;
  description?: string;
  specifications?: ProductSpecification[];
  isActive?: boolean;
};

export type CreateProductTemplateResponse = {
  ok: boolean;
  data: ProductTemplate;
};

export async function createProductTemplate(
  payload: CreateProductTemplateRequest,
  accessToken: string,
) {
  return apiFetch<CreateProductTemplateResponse>("/v1/add-product/templates", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export type AddProductSubcategoryItem = {
  id: string;
  name: string;
  slug: string;
};

export type AddProductSubcategoriesResponse = {
  ok: boolean;
  data: {
    phones?: AddProductSubcategoryItem[];
    tablets?: AddProductSubcategoryItem[];
    accessories?: AddProductSubcategoryItem[];
  };
};

export async function getAddProductSubcategories(accessToken: string) {
  return apiFetch<AddProductSubcategoriesResponse>("/v1/add-product/subcategories", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
