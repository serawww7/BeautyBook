import type { AdminBookingListItem } from "@/lib/admin/types";
import type { BookingStatus } from "@/types/database";

export type DashboardStats = {
  total: number;
  confirmed: number;
  pending: number;
  completed: number;
  cancelled: number;
  freeSlots: number;
};

function countByStatus(
  bookings: AdminBookingListItem[],
  status: BookingStatus,
): number {
  return bookings.filter((booking) => booking.status === status).length;
}

export function buildDashboardStats(
  bookings: AdminBookingListItem[],
  freeSlots: number,
): DashboardStats {
  return {
    total: bookings.length,
    confirmed: countByStatus(bookings, "confirmed"),
    pending: countByStatus(bookings, "pending"),
    completed: countByStatus(bookings, "completed"),
    cancelled: countByStatus(bookings, "cancelled"),
    freeSlots,
  };
}

/** Next upcoming active booking for today (pending/confirmed, starts in the future). */
export function findNextBooking(
  bookings: AdminBookingListItem[],
  now = new Date(),
): AdminBookingListItem | null {
  const nowMs = now.getTime();

  const upcoming = bookings
    .filter(
      (booking) =>
        (booking.status === "pending" || booking.status === "confirmed") &&
        new Date(booking.startsAt).getTime() > nowMs,
    )
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );

  return upcoming[0] ?? null;
}
