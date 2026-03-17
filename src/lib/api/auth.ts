import { apiFetch, apiFetchPublic, apiFetchWithAutoAuth } from "./client";
import type { PermissionSet, UserRole } from "@/lib/rbac";

export type AdminUserRole = "user" | "staff" | "admin";

export type AdminUser = {
  id: string;
  email: string;
  name?: string;
  role: AdminUserRole;
};

type AdminUserSource = {
  id?: unknown;
  userId?: unknown;
  user_id?: unknown;
  staffId?: unknown;
  email?: unknown;
  name?: unknown;
  fullName?: unknown;
  username?: unknown;
  role?: unknown;
};

function normalizeAdminUsers(payload: unknown): AdminUser[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const root = payload as Record<string, unknown>;
  const users = Array.isArray(root.data)
    ? root.data
    : Array.isArray(root.users)
      ? root.users
      : [];

  return users
    .map((item): AdminUser | null => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const source = item as AdminUserSource;
      const id = source.id ?? source.userId ?? source.user_id ?? source.staffId;
      const email = source.email;
      const name = source.name ?? source.fullName ?? source.username;

      if (typeof id !== "string" || typeof email !== "string") {
        return null;
      }

      const role: AdminUserRole =
        source.role === "admin" ||
        source.role === "staff" ||
        source.role === "user"
          ? source.role
          : "user";

      const normalizedName =
        typeof name === "string" && name.trim() ? name : undefined;

      const user: AdminUser = {
        id,
        email,
        role,
      };

      if (normalizedName) {
        user.name = normalizedName;
      }

      return user;
    })
    .filter((user): user is AdminUser => user !== null);
}

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
  role: UserRole;
  permissions: PermissionSet | null;
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
  ok?: boolean;
  user_id: string;
  email: string;
  role: UserRole;
  permissions: PermissionSet | null;
};

export async function getMe(accessToken: string) {
  return apiFetch<UserProfile>("/v1/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export type AdminUsersResponse = {
  ok: boolean;
  data: AdminUser[];
};

export async function getAdminUsers() {
  return apiFetchWithAutoAuth<AdminUsersResponse>("/v1/admin/users", {
    method: "GET",
  });
}

export async function updateAdminUserRole(userId: string, role: UserRole) {
  return apiFetchWithAutoAuth<{ ok?: boolean; message?: string }>(
    `/v1/admin/users/${userId}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({ role }),
    },
  );
}

export async function getAdminUserPermissions(userId: string) {
  return apiFetchWithAutoAuth<{
    ok?: boolean;
    permissions?: PermissionSet | null;
  }>(`/v1/admin/users/${userId}/permissions`, {
    method: "GET",
  });
}

export async function updateAdminUserPermissions(
  userId: string,
  permissions: Partial<PermissionSet>,
) {
  return apiFetchWithAutoAuth<{
    ok?: boolean;
    permissions?: PermissionSet | null;
  }>(`/v1/admin/users/${userId}/permissions`, {
    method: "PATCH",
    body: JSON.stringify(permissions),
  });
}

export async function assignRoleByEmail(email: string, role: UserRole) {
  return apiFetchWithAutoAuth<{ ok?: boolean; message?: string }>(
    `/v1/admin/users/assign-role-by-email`,
    {
      method: "PATCH",
      body: JSON.stringify({ email, role }),
    },
  );
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
