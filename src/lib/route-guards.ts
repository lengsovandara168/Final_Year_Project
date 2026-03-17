import { redirect } from "next/navigation";
import { getValidatedServerSession } from "@/lib/auth-server";
import { hasPermission, type PermissionSet } from "@/lib/rbac";

export async function adminOnly(locale: string) {
  const session = await getValidatedServerSession();
  if (!session.isAuthenticated || !session.user) {
    redirect(`/${locale}/login?next=/${locale}/admin`);
  }

  if (session.user.role !== "admin") {
    redirect(`/${locale}/login`);
  }

  return session;
}

export async function staffOrAdmin(locale: string) {
  const session = await getValidatedServerSession();
  if (!session.isAuthenticated || !session.user) {
    redirect(`/${locale}/login?next=/${locale}/admin`);
  }

  if (session.user.role !== "staff" && session.user.role !== "admin") {
    redirect(`/${locale}/login`);
  }

  return session;
}

export function permissionGuard(
  role: string | undefined,
  permissions: PermissionSet | null | undefined,
  key: keyof PermissionSet,
) {
  return hasPermission(role, permissions, key);
}
