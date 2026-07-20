import { createClient } from "@/lib/supabase/server";

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
  slug = "marina",
): Promise<BookingPageData | null> {
  const supabase = await createClient();

  const { data: salon, error: salonError } = await supabase
    .from("salons")
    .select("id, name, slug, timezone")
    .eq("slug", slug)
    .maybeSingle();

  if (salonError || !salon) return null;

  const { data: master, error: masterError } = await supabase
    .from("masters")
    .select("id, display_name")
    .eq("salon_id", salon.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (masterError || !master) return null;

  const { data: servicesData, error: servicesError } = await supabase
    .from("services")
    .select("id, name, duration_minutes, price")
    .eq("master_id", master.id)
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
    timeZone: salon.timezone,
    masterId: master.id,
    services,
  });

  return {
    salon: {
      id: salon.id,
      name: salon.name,
      slug: salon.slug,
      timezone: salon.timezone,
    },
    master: {
      id: master.id,
      displayName: master.display_name,
    },
    services,
    daysByServiceId,
  };
}
