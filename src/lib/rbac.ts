export type UserRole = "user" | "staff" | "admin";

export type PermissionSet = {
  canCheckIn: boolean;
  canSell: boolean;
  canViewOrders: boolean;
  canViewCustomers: boolean;
  canViewDashboard: boolean;
};

const STAFF_ADMIN_SEGMENTS = new Set(["products"]);

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
  _permissions: PermissionSet | null | undefined,
  segment: string | undefined,
) {
  if (role === "admin") {
    return true;
  }

  if (role !== "staff") {
    return false;
  }

  return Boolean(segment && STAFF_ADMIN_SEGMENTS.has(segment));
}

export function getFirstStaffAdminPath(
  locale: string,
  _permissions: PermissionSet | null | undefined,
) {
  return `/${locale}/admin/products`;
}
