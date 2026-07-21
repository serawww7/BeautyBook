import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingStatusActions } from "@/components/admin/booking-status-actions";
import { ClientBookingHistoryList } from "@/components/admin/client-booking-history";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  formatAdminDate,
  formatAdminTime,
  formatPrice,
} from "@/lib/admin/format";
import {
  getAdminContext,
  getBookingDetail,
  getClientBookingHistory,
} from "@/lib/admin/queries";
import { DEMO_SALON_SLUG } from "@/lib/tenant/config";

type BookingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const { id } = await params;
  const context = await getAdminContext({ salonSlug: DEMO_SALON_SLUG });
  if (!context) {
    notFound();
  }

  const [booking, history] = await Promise.all([
    getBookingDetail(id, context.master.id),
    getClientBookingHistory(id, context.master.id),
  ]);

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

        {history ? (
          <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border pt-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Перший візит</dt>
              <dd className="font-medium">
                {history.firstVisitAt
                  ? formatAdminDate(history.firstVisitAt, timeZone)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Останній запис</dt>
              <dd className="font-medium">
                {history.lastBookingAt
                  ? formatAdminDate(history.lastBookingAt, timeZone)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Усі записи</dt>
              <dd className="font-medium tabular-nums">{history.totalCount}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Завершені</dt>
              <dd className="font-medium tabular-nums">
                {history.completedCount}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Скасовані</dt>
              <dd className="font-medium tabular-nums">
                {history.cancelledCount}
              </dd>
            </div>
          </dl>
        ) : null}

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

      {(booking.status === "pending" || booking.status === "confirmed") ? (
        <Link
          href={`/admin/bookings/${booking.id}/reschedule`}
          className="block w-full rounded-lg border border-border px-4 py-3.5 text-center text-base font-medium"
        >
          Перенести запис
        </Link>
      ) : null}

      <BookingStatusActions
        bookingId={booking.id}
        masterId={booking.masterId}
        status={booking.status}
      />

      {history ? (
        <ClientBookingHistoryList
          bookings={history.bookings}
          timeZone={timeZone}
        />
      ) : null}
    </div>
  );
}
