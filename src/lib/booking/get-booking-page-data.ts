import { createClient } from "@/lib/supabase/server";

import { buildAvailableDays } from "./slots";

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
  service: {
    id: string;
    name: string;
    durationMinutes: number;
    price: number;
  };
  days: ReturnType<typeof buildAvailableDays>;
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

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id, name, duration_minutes, price")
    .eq("master_id", master.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (serviceError || !service) return null;

  const rangeStart = new Date();
  const rangeEnd = new Date(rangeStart.getTime() + 8 * 24 * 60 * 60 * 1000);

  const [{ data: workingHours }, { data: bookings }] = await Promise.all([
    supabase
      .from("working_hours")
      .select("weekday, start_time, end_time")
      .eq("master_id", master.id),
    supabase
      .from("bookings")
      .select("starts_at, ends_at")
      .eq("master_id", master.id)
      .in("status", ["pending", "confirmed"])
      .lt("starts_at", rangeEnd.toISOString())
      .gt("ends_at", rangeStart.toISOString()),
  ]);

  const days = buildAvailableDays({
    timeZone: salon.timezone,
    durationMinutes: service.duration_minutes,
    workingHours: workingHours ?? [],
    bookings: bookings ?? [],
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
    service: {
      id: service.id,
      name: service.name,
      durationMinutes: service.duration_minutes,
      price: Number(service.price),
    },
    days,
  };
}
