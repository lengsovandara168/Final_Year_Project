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
    credentials: "include",
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
  password: string;
};

export type RegisterResponse = {
  message?: string;
  user_id?: string;
};

export async function register(payload: RegisterRequest) {
  return apiFetchPublic<RegisterResponse>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  message?: string;
  access_token?: string;
  refresh_token?: string;
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
  message?: string;
  access_token?: string;
  refresh_token?: string;
};

export async function verifyOtp(payload: OtpVerifyRequest) {
  return apiFetch<OtpVerifyResponse>("/v1/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type LogoutRequest = {
  refresh_token: string;
};

export async function logout(payload: LogoutRequest) {
  return apiFetch<{ message?: string }>("/v1/auth/logout", {
    method: "POST",
    body: JSON.stringify(payload),
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
  sortOrder: number;
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
  sortOrder?: number;
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
  sortOrder?: number;
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
