/**
 * Demo single-tenant binding until multi-salon routing/auth ships.
 * All admin/public pages should resolve context through helpers that take
 * salonSlug + optional masterId — never hardcode IDs inline.
 */
export const DEMO_SALON_SLUG = "marina";

export type TenantScope = {
  salonSlug: string;
  /**
   * When omitted, the oldest active master of the salon is used.
   * Multi-tenant: always pass an explicit masterId (from auth or route).
   */
  masterId?: string;
};
