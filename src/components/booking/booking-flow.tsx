"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";

import {
  createBooking,
  type CreateBookingResult,
} from "@/app/actions/create-booking";
import type { BookingPageData } from "@/lib/booking/get-booking-page-data";
import type { TimeSlot } from "@/lib/booking/slots";

type BookingFlowProps = {
  data: BookingPageData;
};

type SelectedSlot = TimeSlot & {
  dayTitle: string;
  dateLabel: string;
};

function formatSlotSummary(slot: Pick<SelectedSlot, "dayTitle" | "dateLabel" | "label">) {
  return `${slot.dayTitle}, ${slot.dateLabel}, ${slot.label}`;
}

export function BookingFlow({ data }: BookingFlowProps) {
  const router = useRouter();
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{
    bookingId: string;
    slot: SelectedSlot;
    fullName: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const priceLabel = useMemo(
    () =>
      new Intl.NumberFormat("uk-UA", {
        style: "currency",
        currency: "UAH",
        maximumFractionDigits: 0,
      }).format(data.service.price),
    [data.service.price],
  );

  function handleSelectSlot(
    dayTitle: string,
    dateLabel: string,
    slot: TimeSlot,
  ) {
    setSelectedSlot({ ...slot, dayTitle, dateLabel });
    setError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSlot) return;

    setError(null);

    startTransition(async () => {
      const result: CreateBookingResult = await createBooking({
        salonId: data.salon.id,
        masterId: data.master.id,
        serviceId: data.service.id,
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

      setConfirmed({
        bookingId: result.bookingId,
        slot: selectedSlot,
        fullName: fullName.trim(),
      });
    });
  }

  if (confirmed) {
    return (
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-10">
        <div className="rounded-2xl border border-border bg-muted/40 px-5 py-8 text-center">
          <p className="text-sm font-medium text-muted-foreground">Готово</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Ви записані
          </h1>
          <p className="mt-4 text-base text-foreground">
            {confirmed.fullName}, чекаємо на вас
          </p>
          <div className="mt-6 space-y-1 text-sm text-muted-foreground">
            <p>{data.service.name}</p>
            <p>{formatSlotSummary(confirmed.slot)}</p>
            <p>{data.master.displayName}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-10 pt-2">
      <header className="flex flex-col items-center text-center">
        <p className="text-sm text-muted-foreground">{data.salon.name}</p>
        <div
          className="mt-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted text-2xl font-semibold text-muted-foreground"
          aria-hidden
        >
          {data.master.displayName.slice(0, 1)}
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          {data.master.displayName}
        </h1>
      </header>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-muted-foreground">Послуги</h2>
        <div className="mt-3 rounded-xl border border-border px-4 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-medium">{data.service.name}</p>
            <p className="text-sm text-muted-foreground">{priceLabel}</p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.service.durationMinutes} хв
          </p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-muted-foreground">Час</h2>

        {data.days.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            На найближчі дні вільних слотів немає.
          </p>
        ) : (
          <div className="mt-3 space-y-6">
            {data.days.map((day) => (
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
                          handleSelectSlot(day.title, day.dateLabel, slot)
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
        <section className="mt-8 border-t border-border pt-6">
          <h2 className="text-sm font-medium text-muted-foreground">
            Ваші дані
          </h2>
          <p className="mt-2 text-sm text-foreground">
            {formatSlotSummary(selectedSlot)} · {data.service.name}
          </p>

          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1.5 block text-sm">Імʼя</span>
              <input
                required
                name="fullName"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:border-foreground"
                placeholder="Ваше імʼя"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm">Телефон</span>
              <input
                required
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:border-foreground"
                placeholder="+380..."
              />
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
              {isPending ? "Записуємо..." : "Записатися"}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
