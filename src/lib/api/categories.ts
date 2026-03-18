// f:\AUPP\2026\FYP\FYP_Project\src\lib\api\categories.ts

import { apiFetch } from "./client";

export type Category = {
  id: string;
  name: string;
  parentId?: string | null;
  isActive: boolean;
  subcategories?: Category[];
};

export async function getCategories(accessToken: string) {
  return apiFetch<Category[]>("/v1/categories", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function getCategory(id: string, accessToken: string) {
  return apiFetch<Category>(`/v1/categories/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export type CreateCategoryRequest = {
  name: string;
  parentId?: string | null;
  isActive?: boolean;
};

export async function createCategory(
  payload: CreateCategoryRequest,
  accessToken: string,
) {
  return apiFetch<Category>("/v1/categories", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export type UpdateCategoryRequest = {
  name?: string;
  parentId?: string | null;
  isActive?: boolean;
};

export async function updateCategory(
  id: string,
  payload: UpdateCategoryRequest,
  accessToken: string,
) {
  return apiFetch<Category>(`/v1/categories/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(id: string, accessToken: string) {
  return apiFetch<{ message?: string }>(`/v1/categories/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

// ===================== Admin Subcategory Endpoints =====================

export type ParentCategory = "phones" | "tablets" | "accessories";

export type UploadedCategoryIcon = {
  key: string;
  url?: string;
  contentType: string;
  size: number;
};

export type UploadCategoryIconResponse = {
  ok: boolean;
  data: UploadedCategoryIcon;
};

export async function uploadCategoryIcon(file: File, accessToken: string) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<UploadCategoryIconResponse>("/v1/categories/icons/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });
}

export type CreateSubcategoryRequest = {
  parentCategory: ParentCategory;
  name: string;
  slug: string;
  iconKey: string;
  iconUrl?: string;
  isActive?: boolean;
};

export type Subcategory = {
  id: string;
  parentCategory: ParentCategory;
  name: string;
  slug: string;
  iconKey: string;
  iconUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateSubcategoryResponse = {
  ok: boolean;
  data: Subcategory;
};

export async function createSubcategory(
  payload: CreateSubcategoryRequest,
  accessToken: string,
) {
  return apiFetch<CreateSubcategoryResponse>("/v1/categories", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export type UpdateSubcategoryRequest = {
  name?: string;
  slug?: string;
  iconKey?: string;
  iconUrl?: string;
  isActive?: boolean;
};

export type UpdateSubcategoryResponse = {
  ok: boolean;
  data: Subcategory;
};

export async function updateSubcategory(
  id: string,
  payload: UpdateSubcategoryRequest,
  accessToken: string,
) {
  return apiFetch<UpdateSubcategoryResponse>(`/v1/categories/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function getCategoryGroups(accessToken: string) {
  return apiFetch<unknown>("/v1/categories", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export type CategoryBoardItem = {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  iconKey: string;
  isActive: boolean;
};

export type CategoryBoardGroup = {
  key: ParentCategory;
  name: string;
  total: number;
  items: CategoryBoardItem[];
};

export type CategoryBoardResponse = {
  ok: boolean;
  total: number;
  data: CategoryBoardGroup[];
};

export async function getCategoryBoard(accessToken: string) {
  return getCatalogCategoryBoard("/v1/categories/board", accessToken);
}

export async function getAdminCategoryBoard(accessToken: string) {
  return getCatalogCategoryBoard("/v1/admin/categories/board", accessToken);
}

async function getCatalogCategoryBoard(
  endpoint: string,
  accessToken: string,
) {
  return apiFetch<CategoryBoardResponse>(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
