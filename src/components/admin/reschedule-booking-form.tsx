"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { rescheduleBooking } from "@/app/actions/admin";
import type { DaySlots, TimeSlot } from "@/lib/booking/slots";

type RescheduleBookingFormProps = {
  bookingId: string;
  serviceName: string;
  days: DaySlots[];
};

type SelectedSlot = TimeSlot & {
  dayTitle: string;
  dateLabel: string;
};

export function RescheduleBookingForm({
  bookingId,
  serviceName,
  days,
}: RescheduleBookingFormProps) {
  const router = useRouter();
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const summary = useMemo(() => {
    if (!selectedSlot) return null;
    return `${selectedSlot.dayTitle}, ${selectedSlot.dateLabel}, ${selectedSlot.label}`;
  }, [selectedSlot]);

  async function handleReschedule() {
    if (!selectedSlot || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await rescheduleBooking({
        bookingId,
        startsAt: selectedSlot.startsAt,
        endsAt: selectedSlot.endsAt,
      });

      if (!result.ok) {
        setError(result.message);
        if (result.code === "SLOT_TAKEN") {
          setSelectedSlot(null);
          router.refresh();
        }
        setIsSubmitting(false);
        return;
      }

      router.replace(`/admin/bookings/${bookingId}`);
      router.refresh();
    } catch {
      setError("Не вдалося перенести запис. Спробуйте ще раз.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-medium text-muted-foreground">Послуга</h2>
        <div className="mt-3 rounded-xl border border-border px-4 py-3">
          <p className="font-medium">{serviceName}</p>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground">Час</h2>
        {days.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Немає вільних слотів.
          </p>
        ) : (
          <div className="mt-3 space-y-6">
            {days.map((day) => (
              <div key={day.dateKey}>
                <div>
                  <h3 className="text-base font-semibold capitalize">
                    {day.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{day.dateLabel}</p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {day.slots.map((slot) => {
                    const isSelected = selectedSlot?.startsAt === slot.startsAt;

                    return (
                      <button
                        key={slot.startsAt}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() =>
                          setSelectedSlot({
                            ...slot,
                            dayTitle: day.title,
                            dateLabel: day.dateLabel,
                          })
                        }
                        className={
                          isSelected
                            ? "rounded-lg bg-primary px-2 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
                            : "rounded-lg border border-border bg-background px-2 py-3 text-sm font-medium text-foreground disabled:opacity-60"
                        }
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedSlot ? (
        <section className="border-t border-border pt-6 space-y-3">
          {summary ? (
            <p className="text-sm text-foreground">
              {summary} · {serviceName}
            </p>
          ) : null}

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => void handleReschedule()}
            className="w-full rounded-lg bg-primary px-4 py-3.5 text-base font-medium text-primary-foreground disabled:opacity-60"
          >
            {isSubmitting ? "Переносимо..." : "Перенести"}
          </button>
        </section>
      ) : null}
    </div>
  );
}
