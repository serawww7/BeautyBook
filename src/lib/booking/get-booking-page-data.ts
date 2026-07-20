import { createClient } from "@/lib/supabase/server";

import {
  addCalendarDays,
  formatDateKey,
  getZonedParts,
} from "./datetime";
import { buildAvailableDays, type DaySlots } from "./slots";

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

  const rangeStart = new Date();
  const rangeEnd = new Date(rangeStart.getTime() + 8 * 24 * 60 * 60 * 1000);
  const todayParts = getZonedParts(rangeStart, salon.timezone);
  const rangeStartDate = formatDateKey(todayParts);
  const rangeEndDate = formatDateKey(addCalendarDays(todayParts, 8));

  const [{ data: workingHours }, { data: bookings }, { data: exceptions }] =
    await Promise.all([
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
      supabase
        .from("working_day_exceptions")
        .select("date, is_day_off, time_ranges")
        .eq("master_id", master.id)
        .gte("date", rangeStartDate)
        .lte("date", rangeEndDate),
    ]);

  const exceptionRows = (exceptions ?? []).map((row) => ({
    date: row.date as string,
    is_day_off: Boolean(row.is_day_off),
    time_ranges: Array.isArray(row.time_ranges)
      ? (row.time_ranges as { start_time: string; end_time: string }[])
      : [],
  }));

  const daysByServiceId: Record<string, DaySlots[]> = {};

  for (const service of services) {
    daysByServiceId[service.id] = buildAvailableDays({
      timeZone: salon.timezone,
      durationMinutes: service.durationMinutes,
      workingHours: workingHours ?? [],
      bookings: bookings ?? [],
      exceptions: exceptionRows,
    });
  }

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
