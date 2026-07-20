import Link from "next/link";
import { notFound } from "next/navigation";

import { RescheduleBookingForm } from "@/components/admin/reschedule-booking-form";
import {
  formatAdminDate,
  formatAdminTime,
} from "@/lib/admin/format";
import { getBookingDetail } from "@/lib/admin/queries";
import { getMasterAvailableDays } from "@/lib/booking/get-master-available-days";

type ReschedulePageProps = {
  params: Promise<{ id: string }>;
};

export default async function RescheduleBookingPage({
  params,
}: ReschedulePageProps) {
  const { id } = await params;
  const booking = await getBookingDetail(id);

  if (!booking) {
    notFound();
  }

  const canReschedule =
    booking.status === "pending" || booking.status === "confirmed";

  if (!canReschedule) {
    return (
      <div className="mt-4 space-y-4">
        <Link
          href={`/admin/bookings/${booking.id}`}
          className="text-sm text-muted-foreground"
        >
          ← До запису
        </Link>
        <p className="text-sm text-muted-foreground">
          Цей запис не можна перенести (статус: {booking.status}).
        </p>
      </div>
    );
  }

  const daysByServiceId = await getMasterAvailableDays({
    timeZone: booking.salonTimezone,
    masterId: booking.masterId,
    services: [
      {
        id: booking.serviceId,
        durationMinutes: booking.serviceDurationMinutes,
      },
    ],
    excludeBookingId: booking.id,
  });

  const days = daysByServiceId[booking.serviceId] ?? [];
  const timeZone = booking.salonTimezone;

  return (
    <div className="mt-4 space-y-6">
      <Link
        href={`/admin/bookings/${booking.id}`}
        className="text-sm text-muted-foreground"
      >
        ← До запису
      </Link>

      <div>
        <h2 className="text-base font-semibold">Перенести запис</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {booking.clientName} · зараз{" "}
          {formatAdminDate(booking.startsAt, timeZone)},{" "}
          {formatAdminTime(booking.startsAt, timeZone)}
        </p>
      </div>

      <RescheduleBookingForm
        bookingId={booking.id}
        serviceName={booking.serviceName}
        days={days}
      />
    </div>
  );
}
