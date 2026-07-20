import Link from "next/link";

import { StatusBadge } from "@/components/admin/status-badge";
import { formatAdminTime, formatPrice } from "@/lib/admin/format";
import type { AdminBookingListItem } from "@/lib/admin/types";

type BookingListItemProps = {
  booking: AdminBookingListItem;
  timeZone: string;
};

export function BookingListItem({ booking, timeZone }: BookingListItemProps) {
  return (
    <Link
      href={`/admin/bookings/${booking.id}`}
      className="block rounded-xl border border-border bg-background px-4 py-4"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-lg font-semibold tabular-nums">
          {formatAdminTime(booking.startsAt, timeZone)}
        </p>
        <StatusBadge status={booking.status} />
      </div>
      <p className="mt-2 text-base font-medium">{booking.clientName}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {booking.clientPhone}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
        <span>{booking.serviceName}</span>
        <span className="text-muted-foreground">
          {formatPrice(booking.servicePrice)}
        </span>
      </div>
    </Link>
  );
}
