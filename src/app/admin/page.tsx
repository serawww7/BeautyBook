import { BookingListItem } from "@/components/admin/booking-list-item";
import { getAdminContext, getTodayBookings } from "@/lib/admin/queries";
import { formatAdminDate } from "@/lib/admin/format";

export default async function AdminPage() {
  const context = await getAdminContext("marina");

  if (!context) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        Дані салону ще не налаштовані.
      </p>
    );
  }

  const bookings = await getTodayBookings(context.master.id);
  const todayLabel = formatAdminDate(new Date().toISOString(), context.salon.timezone);

  return (
    <div className="mt-4">
      <div className="mb-4">
        <h2 className="text-base font-semibold">Сьогодні</h2>
        <p className="text-sm text-muted-foreground">{todayLabel}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {context.master.displayName}
        </p>
      </div>

      {bookings.length === 0 ? (
        <p className="rounded-xl border border-border px-4 py-8 text-center text-sm text-muted-foreground">
          На сьогодні записів немає.
        </p>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <BookingListItem
              key={booking.id}
              booking={booking}
              timeZone={context.salon.timezone}
            />
          ))}
        </div>
      )}
    </div>
  );
}
