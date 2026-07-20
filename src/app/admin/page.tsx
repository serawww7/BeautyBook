import { BookingListItem } from "@/components/admin/booking-list-item";
import { DashboardQuickActions } from "@/components/admin/dashboard-quick-actions";
import { DashboardStatsGrid } from "@/components/admin/dashboard-stats-grid";
import { NextClientCard } from "@/components/admin/next-client-card";
import { formatAdminDate } from "@/lib/admin/format";
import { getAdminDashboard } from "@/lib/admin/get-admin-dashboard";

export default async function AdminPage() {
  const dashboard = await getAdminDashboard("marina");

  if (!dashboard) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        Дані салону ще не налаштовані.
      </p>
    );
  }

  const { context, bookings, stats, nextBooking, nowIso } = dashboard;
  const todayLabel = formatAdminDate(nowIso, context.salon.timezone);

  return (
    <div className="mt-4 space-y-6">
      <section className="rounded-xl border border-border bg-background px-4 py-5">
        <p className="text-xl font-semibold tracking-tight">
          Доброго дня, {context.master.displayName} 👋
        </p>
        <p className="mt-3 text-sm font-medium text-muted-foreground">
          Сьогодні
        </p>
        <p className="mt-1 text-base text-foreground">{todayLabel}</p>
      </section>

      <section>
        <DashboardStatsGrid stats={stats} />
      </section>

      <section>
        <NextClientCard
          booking={nextBooking}
          timeZone={context.salon.timezone}
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Швидкі дії
        </h2>
        <DashboardQuickActions />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Записи на сьогодні
        </h2>
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
      </section>
    </div>
  );
}
