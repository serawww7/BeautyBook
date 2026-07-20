"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { findClientByPhone } from "@/app/actions/admin";
import {
  createBooking,
  type CreateBookingResult,
} from "@/app/actions/create-booking";
import type { PublicService } from "@/lib/booking/get-booking-page-data";
import type { DaySlots, TimeSlot } from "@/lib/booking/slots";

type AdminNewBookingFormProps = {
  salonId: string;
  masterId: string;
  services: PublicService[];
  daysByServiceId: Record<string, DaySlots[]>;
};

type SelectedSlot = TimeSlot & {
  dayTitle: string;
  dateLabel: string;
};

export function AdminNewBookingForm({
  salonId,
  masterId,
  services,
  daysByServiceId,
}: AdminNewBookingFormProps) {
  const router = useRouter();
  const [selectedServiceId, setSelectedServiceId] = useState(
    services[0]?.id ?? "",
  );
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameFromClient, setNameFromClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedService =
    services.find((service) => service.id === selectedServiceId) ?? services[0];
  const days = selectedService
    ? (daysByServiceId[selectedService.id] ?? [])
    : [];

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSlot || !selectedService || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const result: CreateBookingResult = await createBooking({
        salonId,
        masterId,
        serviceId: selectedService.id,
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
        setIsSubmitting(false);
        return;
      }

      router.replace("/admin");
    } catch {
      setError("Не вдалося створити запис. Спробуйте ще раз.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-medium text-muted-foreground">Послуга</h2>
        <div className="mt-3 space-y-2">
          {services.map((service) => {
            const isSelected = service.id === selectedService?.id;

            return (
              <button
                key={service.id}
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setSelectedServiceId(service.id);
                  setSelectedSlot(null);
                }}
                className={
                  isSelected
                    ? "w-full rounded-xl border border-foreground px-4 py-3 text-left disabled:opacity-60"
                    : "w-full rounded-xl border border-border px-4 py-3 text-left disabled:opacity-60"
                }
              >
                <p className="font-medium">{service.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {service.durationMinutes} хв
                </p>
              </button>
            );
          })}
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

      {selectedSlot && selectedService ? (
        <section className="border-t border-border pt-6">
          <h2 className="text-sm font-medium text-muted-foreground">Клієнт</h2>
          {summary ? (
            <p className="mt-2 text-sm text-foreground">
              {summary} · {selectedService.name}
            </p>
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
                disabled={isSubmitting}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setNameFromClient(false);
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:border-foreground disabled:opacity-60"
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
                disabled={isSubmitting}
                onChange={(event) => {
                  setFullName(event.target.value);
                  setNameFromClient(false);
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:border-foreground disabled:opacity-60"
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
              disabled={isSubmitting}
              className="w-full rounded-lg bg-primary px-4 py-3.5 text-base font-medium text-primary-foreground disabled:opacity-60"
            >
              {isSubmitting ? "Зберігаємо..." : "Створити запис"}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
