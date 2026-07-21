"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateBookingStatus } from "@/app/actions/admin";
import type { BookingStatus } from "@/types/database";

type BookingStatusActionsProps = {
  bookingId: string;
  masterId: string;
  status: BookingStatus;
};

const ACTIONS: { status: BookingStatus; label: string }[] = [
  { status: "confirmed", label: "Підтвердити" },
  { status: "cancelled", label: "Скасувати" },
  { status: "completed", label: "Завершено" },
];

export function BookingStatusActions({
  bookingId,
  masterId,
  status,
}: BookingStatusActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleUpdate(nextStatus: BookingStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, masterId, nextStatus);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        {ACTIONS.map((action) => {
          const isCurrent = status === action.status;

          return (
            <button
              key={action.status}
              type="button"
              disabled={isPending || isCurrent}
              onClick={() => handleUpdate(action.status)}
              className={
                isCurrent
                  ? "rounded-lg border border-border bg-muted px-4 py-3.5 text-base font-medium text-muted-foreground"
                  : "rounded-lg bg-primary px-4 py-3.5 text-base font-medium text-primary-foreground disabled:opacity-60"
              }
            >
              {action.label}
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
