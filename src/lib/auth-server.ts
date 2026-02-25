import { cookies } from "next/headers";

type SessionUser = {
  id: string;
  email: string;
  role: string;
};

type ServerSession = {
  accessToken: string | null;
  user: SessionUser | null;
};

type MePayload = {
  ok?: boolean;
  userId?: string;
  email?: string;
  role?: string;
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

export function getBackendAuthBaseUrl() {
  return getBackendOrigin();
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
  const user = parseAuthUserCookie(cookieStore.get("auth_user")?.value);

  return {
    accessToken,
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
    return { ok: false as const };
  }

  if (!response.ok) {
    return { ok: false as const };
  }

  const data = (await response.json()) as MePayload;
  if (!data.ok || !data.userId || !data.email || !data.role) {
    return { ok: false as const };
  }

  return {
    ok: true as const,
    user: {
      id: data.userId,
      email: data.email,
      role: data.role,
    } satisfies SessionUser,
  };
}

export async function getValidatedServerSession(): Promise<ValidatedServerSession> {
  const session = await getServerSession();
  if (!session.accessToken) {
    return { isAuthenticated: false, user: null };
  }

  const verified = await verifyWithMe(session.accessToken);
  if (!verified.ok) {
    return { isAuthenticated: false, user: null };
  }

  return {
    isAuthenticated: true,
    user: verified.user,
  };
}
