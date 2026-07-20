"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { saveWorkingHours } from "@/app/actions/save-schedule";
import {
  createEmptyInterval,
  type ScheduleDayDraft,
} from "@/lib/admin/schedule";

type ScheduleEditorProps = {
  masterId: string;
  initialDays: ScheduleDayDraft[];
};

export function ScheduleEditor({ masterId, initialDays }: ScheduleEditorProps) {
  const router = useRouter();
  const [days, setDays] = useState<ScheduleDayDraft[]>(initialDays);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateInterval(
    weekday: number,
    key: string,
    field: "start" | "end",
    value: string,
  ) {
    setSuccess(null);
    setDays((current) =>
      current.map((day) =>
        day.weekday !== weekday
          ? day
          : {
              ...day,
              intervals: day.intervals.map((interval) =>
                interval.key === key ? { ...interval, [field]: value } : interval,
              ),
            },
      ),
    );
  }

  function addInterval(weekday: number) {
    setSuccess(null);
    setError(null);
    setDays((current) =>
      current.map((day) =>
        day.weekday !== weekday
          ? day
          : {
              ...day,
              intervals: [...day.intervals, createEmptyInterval(weekday)],
            },
      ),
    );
  }

  function removeInterval(weekday: number, key: string) {
    setSuccess(null);
    setError(null);
    setDays((current) =>
      current.map((day) =>
        day.weekday !== weekday
          ? day
          : {
              ...day,
              intervals: day.intervals.filter((interval) => interval.key !== key),
            },
      ),
    );
  }

  async function handleSave() {
    if (isSubmitting) return;

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const result = await saveWorkingHours(masterId, days);
      if (!result.ok) {
        setError(result.message);
        setIsSubmitting(false);
        return;
      }

      setSuccess("Графік збережено.");
      setIsSubmitting(false);
      router.refresh();
    } catch {
      setError("Не вдалося зберегти графік.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {days.map((day) => (
        <section
          key={day.weekday}
          className="rounded-xl border border-border px-4 py-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold">{day.label}</h3>
            <button
              type="button"
              onClick={() => addInterval(day.weekday)}
              disabled={isSubmitting}
              className="text-sm font-medium text-foreground disabled:opacity-60"
            >
              + Інтервал
            </button>
          </div>

          {day.intervals.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Вихідний</p>
          ) : (
            <div className="mt-3 space-y-3">
              {day.intervals.map((interval) => (
                <div key={interval.key} className="flex items-end gap-2">
                  <label className="min-w-0 flex-1">
                    <span className="mb-1 block text-xs text-muted-foreground">
                      З
                    </span>
                    <input
                      type="time"
                      value={interval.start}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        updateInterval(
                          day.weekday,
                          interval.key,
                          "start",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base tabular-nums outline-none focus:border-foreground disabled:opacity-60"
                    />
                  </label>
                  <label className="min-w-0 flex-1">
                    <span className="mb-1 block text-xs text-muted-foreground">
                      До
                    </span>
                    <input
                      type="time"
                      value={interval.end}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        updateInterval(
                          day.weekday,
                          interval.key,
                          "end",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base tabular-nums outline-none focus:border-foreground disabled:opacity-60"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeInterval(day.weekday, interval.key)}
                    disabled={isSubmitting}
                    className="rounded-lg border border-border px-3 py-3 text-sm text-muted-foreground disabled:opacity-60"
                    aria-label="Видалити інтервал"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="text-sm text-foreground" role="status">
          {success}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={isSubmitting}
        className="w-full rounded-lg bg-primary px-4 py-3.5 text-base font-medium text-primary-foreground disabled:opacity-60"
      >
        {isSubmitting ? "Зберігаємо..." : "Зберегти зміни"}
      </button>
    </div>
  );
}
