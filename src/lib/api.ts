export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://final-year.agritechkh.com";
const API_PROXY_BASE_PATH = "/api";

export type ApiError = {
  message: string;
  status: number;
  details?: unknown;
};

function buildApiUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const base =
    typeof window === "undefined" ? API_BASE_URL : API_PROXY_BASE_PATH;
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function parseError(response: Response) {
  let message = `Request failed with status ${response.status}`;
  let details: unknown;

  try {
    const data = await response.json();
    if (data && typeof data === "object") {
      const payload = data as {
        message?: unknown;
        error?: unknown;
        detail?: unknown;
      };
      if (typeof payload.message === "string" && payload.message.trim()) {
        message = payload.message;
      } else if (typeof payload.error === "string" && payload.error.trim()) {
        message = payload.error;
      } else if (typeof payload.detail === "string" && payload.detail.trim()) {
        message = payload.detail;
      }
    }
    details = data;
  } catch {
    try {
      message = await response.text();
    } catch {
      // ignore
    }
  }

  return {
    message,
    status: response.status,
    details,
  } satisfies ApiError;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const url = buildApiUrl(path);
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

// Fetch function without credentials for public endpoints (to reduce CORS issues)
export async function apiFetchPublic<T>(path: string, init: RequestInit = {}) {
  const url = buildApiUrl(path);
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
    credentials: "omit",
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

// ===================== Auth Endpoints =====================

export type RegisterRequest = {
  email: string;
  name: string;
};

export type RegisterResponse = {
  ok: boolean;
  userId: string;
  email: string;
};

export async function register(payload: RegisterRequest) {
  return apiFetchPublic<RegisterResponse>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type LoginRequest = {
  email: string;
};

export type LoginResponse = {
  ok: boolean;
};

export async function login(payload: LoginRequest) {
  return apiFetchPublic<LoginResponse>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type OtpRequest = {
  email: string;
};

export type OtpRequestResponse = {
  message?: string;
};

export async function requestOtp(payload: OtpRequest) {
  return apiFetchPublic<OtpRequestResponse>("/v1/auth/otp/request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type OtpVerifyRequest = {
  email: string;
  code: string;
};

export type OtpVerifyResponse = {
  ok: boolean;
  userId: string;
  email: string;
  role: string;
  accessToken: string;
};

export async function verifyRegisterOtp(payload: OtpVerifyRequest) {
  return apiFetchPublic<OtpVerifyResponse>("/v1/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyLoginOtp(payload: OtpVerifyRequest) {
  return apiFetchPublic<OtpVerifyResponse>("/v1/auth/login-verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logout(accessToken: string) {
  return apiFetch<{ message?: string }>("/v1/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export type UserProfile = {
  user_id: string;
  email: string;
  role: string;
};

export async function getMe(accessToken: string) {
  return apiFetch<UserProfile>("/v1/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export type DeleteAccountRequest = {
  reason: string;
  confirmation: boolean;
};

export async function deleteAccount(
  payload: DeleteAccountRequest,
  accessToken: string,
) {
  return apiFetch<{ message?: string }>("/v1/auth/account", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

// ===================== Category Endpoints =====================

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
  return apiFetch<CategoryBoardResponse>("/v1/categories/board", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Products API
// ─────────────────────────────────────────────────────────────────────────────

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

export async function getProducts(accessToken: string, subcategorySlug?: string) {
  const params = subcategorySlug ? `?subcategory=${encodeURIComponent(subcategorySlug)}` : "";
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

