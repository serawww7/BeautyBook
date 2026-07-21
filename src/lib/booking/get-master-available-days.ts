import { createClient } from "@/lib/supabase/server";

import {
  addCalendarDays,
  formatDateKey,
  getZonedParts,
} from "./datetime";
import { buildAvailableDays, type DaySlots } from "./slots";

export type ServiceForSlots = {
  id: string;
  durationMinutes: number;
};

export async function getMasterAvailableDays(params: {
  timeZone: string;
  masterId: string;
  services: ServiceForSlots[];
  excludeBookingId?: string;
  dayCount?: number;
}): Promise<Record<string, DaySlots[]>> {
  const {
    timeZone,
    masterId,
    services,
    excludeBookingId,
    dayCount = 7,
  } = params;

  if (services.length === 0) return {};

  const supabase = await createClient();
  const rangeStart = new Date();
  const rangeEnd = new Date(
    rangeStart.getTime() + (dayCount + 1) * 24 * 60 * 60 * 1000,
  );
  const todayParts = getZonedParts(rangeStart, timeZone);
  const rangeStartDate = formatDateKey(todayParts);
  const rangeEndDate = formatDateKey(addCalendarDays(todayParts, dayCount + 1));

  const [{ data: workingHours }, { data: bookings }, { data: exceptions }] =
    await Promise.all([
      supabase
        .from("working_hours")
        .select("weekday, start_time, end_time")
        .eq("master_id", masterId),
      supabase.rpc("list_master_busy_intervals", {
        p_master_id: masterId,
        p_range_start: rangeStart.toISOString(),
        p_range_end: rangeEnd.toISOString(),
      }),
      supabase
        .from("working_day_exceptions")
        .select("date, is_day_off, time_ranges")
        .eq("master_id", masterId)
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

  const busy = (
    (bookings ?? []) as { id: string; starts_at: string; ends_at: string }[]
  )
    .filter((booking) => booking.id !== excludeBookingId)
    .map((booking) => ({
      starts_at: booking.starts_at,
      ends_at: booking.ends_at,
    }));

  const daysByServiceId: Record<string, DaySlots[]> = {};

  for (const service of services) {
    daysByServiceId[service.id] = buildAvailableDays({
      timeZone,
      durationMinutes: service.durationMinutes,
      workingHours: workingHours ?? [],
      bookings: busy,
      exceptions: exceptionRows,
      dayCount,
    });
  }

  return daysByServiceId;
}
