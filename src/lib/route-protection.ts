import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type AuthUser = {
  id: string;
  email: string;
  role: string;
};

type ResolveAuthResult = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  nextAccessToken?: string;
  nextRefreshToken?: string;
  shouldClearAuthCookies?: boolean;
};

type RefreshPayload = {
  ok?: boolean;
  accessToken?: string;
  userId?: string;
  email?: string;
  role?: string;
};

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function hasExpiredTokenError(data: unknown) {
  if (!data || typeof data !== "object") {
    return false;
  }
  const payload = data as { error?: unknown; message?: unknown };
  const message = String(payload.error || payload.message || "").toLowerCase();
  return message.includes("invalid or expired token");
}

async function fetchMe(request: NextRequest, accessToken: string) {
  let response: Response;
  try {
    response = await fetch(`${request.nextUrl.origin}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
  } catch {
    return {
      valid: false as const,
      expired: false,
    };
  }

  if (response.ok) {
    const data = (await response.json()) as {
      ok?: boolean;
      userId?: string;
      email?: string;
      role?: string;
    };
    if (data.ok && data.userId && data.email && data.role) {
      return {
        valid: true as const,
        user: {
          id: data.userId,
          email: data.email,
          role: data.role,
        },
      };
    }
  }

  if (response.status === 401) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    return {
      valid: false as const,
      expired: hasExpiredTokenError(body),
    };
  }

  return {
    valid: false as const,
    expired: false,
  };
}

async function refreshAccessToken(request: NextRequest, refreshToken: string) {
  let response: Response;
  try {
    response = await fetch(`${request.nextUrl.origin}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refresh_token=${encodeURIComponent(refreshToken)}`,
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as RefreshPayload;
  if (!data.ok || !data.accessToken) {
    return null;
  }

  const setCookieHeader = response.headers.get("set-cookie");
  const refreshMatch = setCookieHeader?.match(/refresh_token=([^;]+)/);

  return {
    accessToken: data.accessToken,
    refreshToken: refreshMatch ? decodeURIComponent(refreshMatch[1]) : undefined,
  };
}

function redirectToLogin(request: NextRequest, locale: string) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = `/${locale}/login`;
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export function applyAuthCookies(
  response: NextResponse,
  result: Pick<
    ResolveAuthResult,
    "nextAccessToken" | "nextRefreshToken" | "user" | "shouldClearAuthCookies"
  >,
) {
  if (result.shouldClearAuthCookies) {
    response.cookies.set("access_token", "", { path: "/", maxAge: 0 });
    response.cookies.set("refresh_token", "", { path: "/", maxAge: 0 });
    response.cookies.set("auth_user", "", { path: "/", maxAge: 0 });
    return;
  }

  if (result.nextAccessToken) {
    response.cookies.set("access_token", result.nextAccessToken, {
      path: "/",
      maxAge: COOKIE_MAX_AGE_SECONDS,
      sameSite: "lax",
    });
  }

  if (result.nextRefreshToken) {
    response.cookies.set("refresh_token", result.nextRefreshToken, {
      path: "/",
      maxAge: COOKIE_MAX_AGE_SECONDS,
      sameSite: "lax",
    });
  }

  if (result.user) {
    response.cookies.set("auth_user", JSON.stringify(result.user), {
      path: "/",
      maxAge: COOKIE_MAX_AGE_SECONDS,
      sameSite: "lax",
    });
  }
}

export async function resolveAuth(request: NextRequest): Promise<ResolveAuthResult> {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (accessToken) {
    const me = await fetchMe(request, accessToken);
    if (me.valid) {
      return {
        isAuthenticated: true,
        user: me.user,
      };
    }

    if (!me.expired) {
      return {
        isAuthenticated: false,
        user: null,
      };
    }
  }

  if (!refreshToken) {
    return {
      isAuthenticated: false,
      user: null,
      shouldClearAuthCookies: true,
    };
  }

  const refreshed = await refreshAccessToken(request, refreshToken);
  if (!refreshed?.accessToken) {
    return {
      isAuthenticated: false,
      user: null,
      shouldClearAuthCookies: true,
    };
  }

  const meWithRefreshedToken = await fetchMe(request, refreshed.accessToken);
  if (!meWithRefreshedToken.valid) {
    return {
      isAuthenticated: false,
      user: null,
      shouldClearAuthCookies: true,
    };
  }

  return {
    isAuthenticated: true,
    user: meWithRefreshedToken.user,
    nextAccessToken: refreshed.accessToken,
    nextRefreshToken: refreshed.refreshToken,
  };
}

export async function requireAdmin(request: NextRequest, locale: string) {
  const auth = await resolveAuth(request);
  if (!auth.isAuthenticated) {
    const response = redirectToLogin(request, locale);
    applyAuthCookies(response, auth);
    return response;
  }

  if (auth.user?.role !== "admin") {
    const destination = auth.user?.role === "user" ? `/${locale}/users` : `/${locale}/login`;
    const response = NextResponse.redirect(new URL(destination, request.url));
    applyAuthCookies(response, auth);
    return response;
  }

  return auth;
}

export async function requireUser(request: NextRequest, locale: string) {
  const auth = await resolveAuth(request);
  if (!auth.isAuthenticated) {
    const response = redirectToLogin(request, locale);
    applyAuthCookies(response, auth);
    return response;
  }

  if (auth.user?.role !== "user") {
    const destination = auth.user?.role === "admin" ? `/${locale}/admin` : `/${locale}/login`;
    const response = NextResponse.redirect(new URL(destination, request.url));
    applyAuthCookies(response, auth);
    return response;
  }

  return auth;
}
