// f:\AUPP\2026\FYP\FYP_Project\src\lib\api\client.ts

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://final-year.agritechkh.com";
const API_PROXY_BASE_PATH = "/api";

export type ApiError = {
  message: string;
  status: number;
  details?: unknown;
};

function getClientAccessToken() {
  if (typeof document === "undefined") {
    return null;
  }

  const encodedName = "access_token=";
  const cookies = document.cookie.split(";");
  for (const rawCookie of cookies) {
    const cookie = rawCookie.trim();
    if (cookie.startsWith(encodedName)) {
      return decodeURIComponent(cookie.slice(encodedName.length));
    }
  }

  return null;
}

function handleAuthErrorStatus(status: number) {
  if (typeof window === "undefined") {
    return;
  }

  if (status === 401) {
    document.cookie = "access_token=; Path=/; Max-Age=0; SameSite=Lax";
    document.cookie = "auth_user=; Path=/; Max-Age=0; SameSite=Lax";

    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_user");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("auth_user");

    const locale =
      window.location.pathname.split("/").filter(Boolean)[0] || "en";
    window.location.assign(`/${locale}/login`);
    return;
  }

  if (status === 403) {
    document.cookie = `flash_toast=${encodeURIComponent("No permission to perform this action.")}; Path=/; Max-Age=10; SameSite=Lax`;
  }
}

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

  const errorObj = {
    message,
    status: response.status,
    details,
  } satisfies ApiError;

  // Log for debugging
  if (typeof window !== "undefined") {
    console.debug("API Error:", {
      url: response.url,
      status: response.status,
      message,
      details,
    });
  }

  return errorObj;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const url = buildApiUrl(path);
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  try {
    console.debug(`📤 API Request: ${init.method || "GET"} ${url}`);

    const response = await fetch(url, {
      ...init,
      headers,
    });

    console.debug(`📥 API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      handleAuthErrorStatus(response.status);
      const error = await parseError(response);
      throw error;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return (await response.json()) as T;
    }

    return (await response.text()) as T;
  } catch (error) {
    // Check if it's a network error
    if (error instanceof TypeError) {
      console.error(`🌐 Network Error:`, error.message);
      throw new Error(`Network error: ${error.message}`);
    }

    // Log unexpected errors (not ApiError)
    if (!(error && typeof error === "object" && "status" in error)) {
      console.error("Unexpected API error:", error);
    }
    throw error;
  }
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

function readCookieValue(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const encodedName = `${name}=`;
  const cookies = document.cookie.split(";");

  for (const rawCookie of cookies) {
    const cookie = rawCookie.trim();
    if (cookie.startsWith(encodedName)) {
      return decodeURIComponent(cookie.slice(encodedName.length));
    }
  }

  return null;
}

function readAccessTokenFromBrowser() {
  if (typeof window === "undefined") {
    return null;
  }

  const fromCookie = readCookieValue("access_token");
  if (fromCookie) {
    return fromCookie;
  }

  const fromLocalStorage = window.localStorage.getItem("access_token");
  if (fromLocalStorage) {
    return fromLocalStorage;
  }

  const fromSessionStorage = window.sessionStorage.getItem("access_token");
  if (fromSessionStorage) {
    return fromSessionStorage;
  }

  return null;
}

export async function apiFetchWithAutoAuth<T>(
  path: string,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers);
  const accessToken = readAccessTokenFromBrowser();

  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return apiFetch<T>(path, {
    ...init,
    headers,
  });
}
