import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingStatusActions } from "@/components/admin/booking-status-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  formatAdminDate,
  formatAdminTime,
  formatPrice,
} from "@/lib/admin/format";
import { getBookingDetail } from "@/lib/admin/queries";

type BookingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const { id } = await params;
  const booking = await getBookingDetail(id);

  if (!booking) {
    notFound();
  }

  const timeZone = booking.salonTimezone;

  return (
    <div className="mt-4 space-y-6">
      <Link href="/admin" className="text-sm text-muted-foreground">
        ← До записів
      </Link>

      <div className="rounded-xl border border-border px-4 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold tracking-tight">
              {booking.clientName}
            </p>
            <p className="mt-1 text-base text-muted-foreground">
              {booking.clientPhone}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Послуга</dt>
            <dd className="font-medium">{booking.serviceName}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Ціна</dt>
            <dd className="font-medium">{formatPrice(booking.servicePrice)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Дата</dt>
            <dd className="font-medium">
              {formatAdminDate(booking.startsAt, timeZone)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Час</dt>
            <dd className="font-medium tabular-nums">
              {formatAdminTime(booking.startsAt, timeZone)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Нотатки</dt>
            <dd className="max-w-[60%] text-right font-medium">
              {booking.notes?.trim() ? booking.notes : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <BookingStatusActions bookingId={booking.id} status={booking.status} />
    </div>
  );
}
