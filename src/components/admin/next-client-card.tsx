import Link from "next/link";

import { formatAdminTime } from "@/lib/admin/format";
import type { AdminBookingListItem } from "@/lib/admin/types";

type NextClientCardProps = {
  booking: AdminBookingListItem | null;
  timeZone: string;
};

export function NextClientCard({ booking, timeZone }: NextClientCardProps) {
  if (!booking) {
    return (
      <div className="rounded-xl border border-border bg-muted/40 px-4 py-5">
        <p className="text-sm font-medium text-muted-foreground">
          Наступний клієнт
        </p>
        <p className="mt-2 text-base text-foreground">
          На сьогодні всі записи завершені.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-background px-4 py-5">
      <p className="text-sm font-medium text-muted-foreground">
        Наступний клієнт
      </p>
      <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">
        {formatAdminTime(booking.startsAt, timeZone)}
      </p>
      <p className="mt-2 text-base font-medium">{booking.clientName}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {booking.serviceName}
      </p>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {booking.clientPhone}
      </p>
      <Link
        href={`/admin/bookings/${booking.id}`}
        className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-base font-medium text-primary-foreground"
      >
        Відкрити
      </Link>
    </div>
  );
}
