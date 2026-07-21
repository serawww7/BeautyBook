import { BookingFlow } from "@/components/booking/booking-flow";
import { getBookingPageData } from "@/lib/booking/get-booking-page-data";
import { DEMO_SALON_SLUG } from "@/lib/tenant/config";

export default async function HomePage() {
  const data = await getBookingPageData({ salonSlug: DEMO_SALON_SLUG });

  if (!data) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 text-center">
        <h1 className="text-xl font-semibold">BeautyBook</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Дані для запису ще не налаштовані.
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <BookingFlow data={data} />
    </main>
  );
}
