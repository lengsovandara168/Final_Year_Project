export type UserRole = "user" | "staff" | "admin";

export type PermissionSet = {
  canCheckIn: boolean;
  canSell: boolean;
  canViewOrders: boolean;
  canViewCustomers: boolean;
  canViewDashboard: boolean;
};

export const EMPTY_PERMISSIONS: PermissionSet = {
  canCheckIn: false,
  canSell: false,
  canViewOrders: false,
  canViewCustomers: false,
  canViewDashboard: false,
};

export function normalizePermissions(raw: unknown): PermissionSet | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const data = raw as Partial<PermissionSet>;

  return {
    canCheckIn: Boolean(data.canCheckIn),
    canSell: Boolean(data.canSell),
    canViewOrders: Boolean(data.canViewOrders),
    canViewCustomers: Boolean(data.canViewCustomers),
    canViewDashboard: Boolean(data.canViewDashboard),
  };
}

export function hasPermission(
  role: UserRole | string | undefined,
  permissions: PermissionSet | null | undefined,
  key: keyof PermissionSet,
) {
  if (role === "admin") {
    return true;
  }

  if (role !== "staff") {
    return false;
  }

  return Boolean(permissions?.[key]);
}

export function canAccessAdminSegment(
  role: UserRole | string | undefined,
  permissions: PermissionSet | null | undefined,
  segment: string | undefined,
) {
  if (role === "admin") {
    return true;
  }

  if (role !== "staff") {
    return false;
  }

  if (!segment) {
    return hasPermission(role, permissions, "canViewDashboard");
  }

  if (segment === "staff" || segment === "role_access") {
    return false;
  }

  if (segment === "sales") {
    return (
      hasPermission(role, permissions, "canSell") ||
      hasPermission(role, permissions, "canCheckIn")
    );
  }

  if (segment === "orders") {
    return hasPermission(role, permissions, "canViewOrders");
  }

  if (segment === "customers") {
    return hasPermission(role, permissions, "canViewCustomers");
  }

  if (segment === "products") {
    return hasPermission(role, permissions, "canCheckIn");
  }

  return false;
}

export function getFirstStaffAdminPath(
  locale: string,
  permissions: PermissionSet | null | undefined,
) {
  if (permissions?.canViewDashboard) {
    return `/${locale}/admin`;
  }

  if (permissions?.canSell || permissions?.canCheckIn) {
    return `/${locale}/admin/sales`;
  }

  if (permissions?.canViewOrders) {
    return `/${locale}/admin/orders`;
  }

  if (permissions?.canViewCustomers) {
    return `/${locale}/admin/customers`;
  }

  if (permissions?.canCheckIn) {
    return `/${locale}/admin/products`;
  }

  return `/${locale}/login`;
}
