import { createClient } from "@/lib/supabase/server";
import { DEMO_SALON_SLUG, type TenantScope } from "@/lib/tenant/config";
import { resolveTenantContext } from "@/lib/tenant/context";

import { getMasterAvailableDays } from "./get-master-available-days";
import type { DaySlots } from "./slots";

export type PublicService = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
};

export type BookingPageData = {
  salon: {
    id: string;
    name: string;
    slug: string;
    timezone: string;
  };
  master: {
    id: string;
    displayName: string;
  };
  services: PublicService[];
  daysByServiceId: Record<string, DaySlots[]>;
};

export async function getBookingPageData(
  scope: TenantScope | string = { salonSlug: DEMO_SALON_SLUG },
): Promise<BookingPageData | null> {
  const normalized: TenantScope =
    typeof scope === "string" ? { salonSlug: scope } : scope;

  const tenant = await resolveTenantContext(normalized);
  if (!tenant) return null;

  const supabase = await createClient();

  const { data: servicesData, error: servicesError } = await supabase
    .from("services")
    .select("id, name, duration_minutes, price")
    .eq("master_id", tenant.master.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (servicesError || !servicesData || servicesData.length === 0) return null;

  const services: PublicService[] = servicesData.map((service) => ({
    id: service.id,
    name: service.name,
    durationMinutes: service.duration_minutes,
    price: Number(service.price),
  }));

  const daysByServiceId = await getMasterAvailableDays({
    timeZone: tenant.salon.timezone,
    masterId: tenant.master.id,
    services,
  });

  return {
    salon: tenant.salon,
    master: {
      id: tenant.master.id,
      displayName: tenant.master.displayName,
    },
    services,
    daysByServiceId,
  };
}
