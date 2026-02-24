import { cookies } from "next/headers";

type SessionUser = {
  id: string;
  email: string;
  role: string;
};

type ServerSession = {
  accessToken: string | null;
  refreshToken: string | null;
  user: SessionUser | null;
};

type MePayload = {
  ok?: boolean;
  userId?: string;
  email?: string;
  role?: string;
  error?: string;
  message?: string;
};

type RefreshPayload = {
  ok?: boolean;
  accessToken?: string;
  error?: string;
  message?: string;
};

type ValidatedServerSession = {
  isAuthenticated: boolean;
  user: SessionUser | null;
};

function getBackendOrigin() {
  const rawOrigin =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://final-year.agritechkh.com";
  return rawOrigin.endsWith("/") ? rawOrigin.slice(0, -1) : rawOrigin;
}

function isExpiredTokenError(payload: { error?: string; message?: string }) {
  const message = String(payload.error || payload.message || "").toLowerCase();
  return message.includes("invalid or expired token");
}

function parseAuthUserCookie(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<SessionUser>;
    if (
      typeof parsed.id === "string" &&
      typeof parsed.email === "string" &&
      typeof parsed.role === "string"
    ) {
      return {
        id: parsed.id,
        email: parsed.email,
        role: parsed.role,
      } satisfies SessionUser;
    }
  } catch {
    return null;
  }

  return null;
}

export async function getServerSession(): Promise<ServerSession> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value ?? null;
  const refreshToken = cookieStore.get("refresh_token")?.value ?? null;
  const user = parseAuthUserCookie(cookieStore.get("auth_user")?.value);

  return {
    accessToken,
    refreshToken,
    user,
  };
}

async function verifyWithMe(accessToken: string) {
  let response: Response;
  try {
    response = await fetch(`${getBackendOrigin()}/v1/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
  } catch {
    return { ok: false as const, expired: false };
  }

  if (response.ok) {
    const data = (await response.json()) as MePayload;
    if (data.ok && data.userId && data.email && data.role) {
      return {
        ok: true as const,
        user: {
          id: data.userId,
          email: data.email,
          role: data.role,
        } satisfies SessionUser,
      };
    }
    return { ok: false as const, expired: false };
  }

  if (response.status === 401) {
    let body: MePayload = {};
    try {
      body = (await response.json()) as MePayload;
    } catch {
      body = {};
    }
    return {
      ok: false as const,
      expired: isExpiredTokenError({
        error: body.error,
        message: body.message,
      }),
    };
  }

  return { ok: false as const, expired: false };
}

async function refreshAccessToken(refreshToken: string) {
  let response: Response;
  try {
    response = await fetch(`${getBackendOrigin()}/v1/auth/refresh`, {
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

  return data.accessToken;
}

export async function getValidatedServerSession(): Promise<ValidatedServerSession> {
  const session = await getServerSession();
  if (!session.accessToken) {
    return { isAuthenticated: false, user: null };
  }

  const verified = await verifyWithMe(session.accessToken);
  if (verified.ok) {
    return {
      isAuthenticated: true,
      user: verified.user,
    };
  }

  if (!verified.expired || !session.refreshToken) {
    return { isAuthenticated: false, user: null };
  }

  const refreshedAccessToken = await refreshAccessToken(session.refreshToken);
  if (!refreshedAccessToken) {
    return { isAuthenticated: false, user: null };
  }

  const reverified = await verifyWithMe(refreshedAccessToken);
  if (!reverified.ok) {
    return { isAuthenticated: false, user: null };
  }

  return {
    isAuthenticated: true,
    user: reverified.user,
  };
}
