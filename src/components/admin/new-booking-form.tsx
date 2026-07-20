"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type FormEvent,
} from "react";

import { findClientByPhone } from "@/app/actions/admin";
import {
  createBooking,
  type CreateBookingResult,
} from "@/app/actions/create-booking";
import type { DaySlots, TimeSlot } from "@/lib/booking/slots";

type AdminNewBookingFormProps = {
  salonId: string;
  masterId: string;
  serviceId: string;
  serviceName: string;
  days: DaySlots[];
};

type SelectedSlot = TimeSlot & {
  dayTitle: string;
  dateLabel: string;
};

export function AdminNewBookingForm({
  salonId,
  masterId,
  serviceId,
  serviceName,
  days,
}: AdminNewBookingFormProps) {
  const router = useRouter();
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameFromClient, setNameFromClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const trimmed = phone.trim();
    if (trimmed.length < 7) {
      setNameFromClient(false);
      return;
    }

    const timer = setTimeout(() => {
      void (async () => {
        const result = await findClientByPhone(trimmed);
        if (!result.ok) return;

        if (result.client) {
          setFullName(result.client.fullName);
          setNameFromClient(true);
        } else {
          setNameFromClient(false);
        }
      })();
    }, 350);

    return () => clearTimeout(timer);
  }, [phone]);

  const summary = useMemo(() => {
    if (!selectedSlot) return null;
    return `${selectedSlot.dayTitle}, ${selectedSlot.dateLabel}, ${selectedSlot.label}`;
  }, [selectedSlot]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSlot) return;

    setError(null);

    startTransition(async () => {
      const result: CreateBookingResult = await createBooking({
        salonId,
        masterId,
        serviceId,
        startsAt: selectedSlot.startsAt,
        endsAt: selectedSlot.endsAt,
        fullName,
        phone,
      });

      if (!result.ok) {
        setError(result.message);
        if (result.code === "SLOT_TAKEN") {
          setSelectedSlot(null);
          router.refresh();
        }
        return;
      }

      router.push(`/admin/bookings/${result.bookingId}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-medium text-muted-foreground">Послуга</h2>
        <p className="mt-2 text-base font-medium">{serviceName}</p>
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
                        onClick={() =>
                          setSelectedSlot({
                            ...slot,
                            dayTitle: day.title,
                            dateLabel: day.dateLabel,
                          })
                        }
                        className={
                          isSelected
                            ? "rounded-lg bg-primary px-2 py-3 text-sm font-medium text-primary-foreground"
                            : "rounded-lg border border-border bg-background px-2 py-3 text-sm font-medium text-foreground"
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
        <section className="border-t border-border pt-6">
          <h2 className="text-sm font-medium text-muted-foreground">Клієнт</h2>
          {summary ? (
            <p className="mt-2 text-sm text-foreground">{summary}</p>
          ) : null}

          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1.5 block text-sm">Телефон</span>
              <input
                required
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setNameFromClient(false);
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:border-foreground"
                placeholder="+380..."
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm">Імʼя</span>
              <input
                required
                name="fullName"
                autoComplete="name"
                value={fullName}
                onChange={(event) => {
                  setFullName(event.target.value);
                  setNameFromClient(false);
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:border-foreground"
                placeholder="Імʼя клієнта"
              />
              {nameFromClient ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Знайдено існуючого клієнта
                </p>
              ) : null}
            </label>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-primary px-4 py-3.5 text-base font-medium text-primary-foreground disabled:opacity-60"
            >
              {isPending ? "Зберігаємо..." : "Створити запис"}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
