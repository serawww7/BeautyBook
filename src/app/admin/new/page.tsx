import Link from "next/link";

import { AdminNewBookingForm } from "@/components/admin/new-booking-form";
import { getBookingPageData } from "@/lib/booking/get-booking-page-data";

export default async function AdminNewBookingPage() {
  const data = await getBookingPageData("marina");

  if (!data) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        Дані для запису ще не налаштовані.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <Link href="/admin" className="text-sm text-muted-foreground">
        ← До записів
      </Link>
      <h2 className="text-base font-semibold">Новий запис</h2>
      <AdminNewBookingForm
        salonId={data.salon.id}
        masterId={data.master.id}
        serviceId={data.service.id}
        serviceName={data.service.name}
        days={data.days}
      />
    </div>
  );
}
