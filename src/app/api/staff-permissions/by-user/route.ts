import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { EMPTY_PERMISSIONS, normalizePermissions, type PermissionSet } from "@/lib/rbac";
import { API_BASE_URL } from "@/lib/api/client";

const STAFF_PERMISSIONS_BY_USER_COOKIE = "staff_permissions_by_user";

type AuthCookieUser = {
  role?: string;
};

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type PermissionsByUser = Record<string, PermissionSet>;

function parsePermissionsByUser(rawValue: string | undefined | null): PermissionsByUser {
  if (!rawValue) {
    return {};
  }

  const parse = (value: string) => {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return null;
      }

      const result: PermissionsByUser = {};
      for (const [userId, permissions] of Object.entries(parsed)) {
        if (!userId) {
          continue;
        }

        const normalized = normalizePermissions(permissions) ?? EMPTY_PERMISSIONS;
        result[userId] = normalized;
      }

      return result;
    } catch {
      return null;
    }
  };

  const direct = parse(rawValue);
  if (direct) {
    return direct;
  }

  try {
    const decoded = decodeURIComponent(rawValue);
    const decodedParsed = parse(decoded);
    if (decodedParsed) {
      return decodedParsed;
    }
  } catch {
    // Ignore decode errors and return empty map.
  }

  return {};
}

function serializePermissionsByUser(map: PermissionsByUser) {
  const output: PermissionsByUser = {};
  for (const [userId, permissions] of Object.entries(map)) {
    if (!userId) {
      continue;
    }

    output[userId] = normalizePermissions(permissions) ?? EMPTY_PERMISSIONS;
  }

  return JSON.stringify(output);
}

function readAuthRole(rawAuthUser: string | undefined) {
  if (!rawAuthUser) {
    return null;
  }

  const tryParse = (value: string) => {
    try {
      const parsed = JSON.parse(value) as AuthCookieUser;
      if (typeof parsed.role === "string") {
        return parsed.role;
      }
    } catch {
      return null;
    }

    return null;
  };

  const direct = tryParse(rawAuthUser);
  if (direct) {
    return direct;
  }

  try {
    return tryParse(decodeURIComponent(rawAuthUser));
  } catch {
    return null;
  }
}

function normalizeUsers(payload: unknown): UserItem[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const data = Array.isArray(record.data)
    ? record.data
    : Array.isArray(record.users)
      ? record.users
      : [];

  return data
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const source = item as Record<string, unknown>;
      const idCandidate =
        source.id ?? source.userId ?? source.user_id ?? source.staffId;
      const emailCandidate = source.email;
      const nameCandidate = source.name ?? source.fullName ?? source.username;
      const roleCandidate = source.role;

      if (typeof idCandidate !== "string" || typeof emailCandidate !== "string") {
        return null;
      }

      return {
        id: idCandidate,
        email: emailCandidate,
        name:
          typeof nameCandidate === "string" && nameCandidate.trim()
            ? nameCandidate
            : emailCandidate.split("@")[0] || "User",
        role:
          typeof roleCandidate === "string" && roleCandidate.trim()
            ? roleCandidate
            : "user",
      } satisfies UserItem;
    })
    .filter((item): item is UserItem => Boolean(item));
}

async function getUsersFromBackend(accessToken: string | undefined) {
  if (!accessToken) {
    return [] as UserItem[];
  }

  const backendOrigin = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  const candidates = ["/v1/admin/users", "/v1/users"];

  for (const path of candidates) {
    try {
      const response = await fetch(`${backendOrigin}${path}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as unknown;
      const users = normalizeUsers(payload);
      if (users.length > 0) {
        return users;
      }
    } catch {
      // Try the next candidate path.
    }
  }

  return [] as UserItem[];
}

export async function GET() {
  const cookieStore = await cookies();
  const role = readAuthRole(cookieStore.get("auth_user")?.value);

  if (role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const assignments = parsePermissionsByUser(
    cookieStore.get(STAFF_PERMISSIONS_BY_USER_COOKIE)?.value,
  );

  const users = await getUsersFromBackend(cookieStore.get("access_token")?.value);

  return NextResponse.json({ users, assignments });
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const role = readAuthRole(cookieStore.get("auth_user")?.value);

  if (role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    userId?: string;
    permissions?: unknown;
  };

  if (!body.userId || typeof body.userId !== "string") {
    return NextResponse.json({ message: "userId is required" }, { status: 400 });
  }

  const assignments = parsePermissionsByUser(
    cookieStore.get(STAFF_PERMISSIONS_BY_USER_COOKIE)?.value,
  );

  assignments[body.userId] = normalizePermissions(body.permissions) ?? EMPTY_PERMISSIONS;

  const response = NextResponse.json({
    userId: body.userId,
    permissions: assignments[body.userId],
  });

  response.cookies.set(
    STAFF_PERMISSIONS_BY_USER_COOKIE,
    serializePermissionsByUser(assignments),
    {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    },
  );

  return response;
}
