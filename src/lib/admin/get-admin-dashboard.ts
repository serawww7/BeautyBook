import {
  addCalendarDays,
  formatDateKey,
  getZonedParts,
} from "@/lib/booking/datetime";
import { buildAvailableDays } from "@/lib/booking/slots";
import { DEMO_SALON_SLUG, type TenantScope } from "@/lib/tenant/config";

import { buildDashboardStats, findNextBooking } from "./dashboard";
import {
  getAdminContext,
  getTodayBookings,
  getWorkingDayExceptions,
  getWorkingHours,
} from "./queries";

export async function getAdminDashboard(
  scope: TenantScope | string = { salonSlug: DEMO_SALON_SLUG },
) {
  const context = await getAdminContext(scope);
  if (!context) return null;

  const now = new Date();
  const bookings = await getTodayBookings(context.master.id);

  const [workingHours, exceptions] = await Promise.all([
    getWorkingHours(context.master.id),
    getWorkingDayExceptions(context.master.id),
  ]);

  const todayParts = getZonedParts(now, context.salon.timezone);
  const todayKey = formatDateKey(todayParts);
  const rangeEndDate = formatDateKey(addCalendarDays(todayParts, 1));

  const todayExceptions = exceptions
    .filter((item) => item.date >= todayKey && item.date <= rangeEndDate)
    .map((item) => ({
      date: item.date,
      is_day_off: item.isDayOff,
      time_ranges: item.timeRanges,
    }));

  const freeDays = buildAvailableDays({
    timeZone: context.salon.timezone,
    durationMinutes: context.service.durationMinutes,
    workingHours,
    bookings: bookings
      .filter(
        (booking) =>
          booking.status === "pending" || booking.status === "confirmed",
      )
      .map((booking) => ({
        starts_at: booking.startsAt,
        ends_at: booking.endsAt,
      })),
    exceptions: todayExceptions,
    dayCount: 1,
    now,
  });

  const freeSlots = freeDays[0]?.slots.length ?? 0;
  const stats = buildDashboardStats(bookings, freeSlots);
  const nextBooking = findNextBooking(bookings, now);

  return {
    context,
    bookings,
    stats,
    nextBooking,
    nowIso: now.toISOString(),
  };
}
