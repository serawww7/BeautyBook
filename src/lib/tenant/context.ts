import { createClient } from "@/lib/supabase/server";

import { DEMO_SALON_SLUG, type TenantScope } from "./config";

export type TenantSalon = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
};

export type TenantMaster = {
  id: string;
  salonId: string;
  displayName: string;
};

export type TenantPrimaryService = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
};

export type TenantContext = {
  salon: TenantSalon;
  master: TenantMaster;
  /**
   * First active service for this master — used only for dashboard free-slot
   * estimate. Slot booking always uses an explicit selected service.
   */
  primaryService: TenantPrimaryService;
};

/**
 * Resolves salon + master (+ primary service) for a tenant scope.
 * Prefers explicit masterId; falls back to oldest active master in salon.
 */
export async function resolveTenantContext(
  scope: TenantScope = { salonSlug: DEMO_SALON_SLUG },
): Promise<TenantContext | null> {
  const supabase = await createClient();

  const { data: salon } = await supabase
    .from("salons")
    .select("id, name, slug, timezone")
    .eq("slug", scope.salonSlug)
    .maybeSingle();

  if (!salon) return null;

  let masterQuery = supabase
    .from("masters")
    .select("id, salon_id, display_name")
    .eq("salon_id", salon.id)
    .eq("is_active", true);

  if (scope.masterId) {
    masterQuery = masterQuery.eq("id", scope.masterId);
  } else {
    masterQuery = masterQuery
      .order("created_at", { ascending: true })
      .limit(1);
  }

  const { data: master } = await masterQuery.maybeSingle();
  if (!master) return null;

  const { data: service } = await supabase
    .from("services")
    .select("id, name, duration_minutes, price")
    .eq("master_id", master.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!service) return null;

  return {
    salon: {
      id: salon.id,
      name: salon.name,
      slug: salon.slug,
      timezone: salon.timezone,
    },
    master: {
      id: master.id,
      salonId: master.salon_id,
      displayName: master.display_name,
    },
    primaryService: {
      id: service.id,
      name: service.name,
      durationMinutes: service.duration_minutes,
      price: Number(service.price),
    },
  };
}
