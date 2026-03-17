/**
 * @deprecated Legacy cookie-based staff permission helpers were replaced by
 * backend-driven RBAC in `src/lib/rbac.ts` and `/api/staff-permissions/by-user`.
 * Keep this shim only to avoid stale imports during migration cleanup.
 */

export type StaffPermission =
  | "can_sell"
  | "can_check_in"
  | "can_view_orders"
  | "can_view_customers"
  | "can_manage_products";

export const STAFF_PERMISSIONS_COOKIE = "staff_permissions";
export const STAFF_PERMISSIONS_BY_USER_COOKIE = "staff_permissions_by_user";
