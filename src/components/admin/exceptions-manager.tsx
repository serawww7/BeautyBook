"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  deleteWorkingDayException,
  upsertWorkingDayException,
} from "@/app/actions/exceptions";
import {
  createExceptionInterval,
  formatExceptionSummary,
  type ExceptionDraft,
  type WorkingDayException,
} from "@/lib/admin/exceptions";
import { normalizeTimeInput } from "@/lib/admin/schedule";

type ExceptionsManagerProps = {
  masterId: string;
  initialItems: WorkingDayException[];
};

function toDraft(item?: WorkingDayException | null): ExceptionDraft {
  if (!item) {
    return {
      date: "",
      isDayOff: false,
      intervals: [createExceptionInterval()],
    };
  }

  return {
    id: item.id,
    date: item.date,
    isDayOff: item.isDayOff,
    intervals: item.isDayOff
      ? []
      : item.timeRanges.map((range, index) => ({
          key: `${item.id}-${index}`,
          start: normalizeTimeInput(range.start_time),
          end: normalizeTimeInput(range.end_time),
        })),
  };
}

function formatDateUk(date: string): string {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function ExceptionsManager({
  masterId,
  initialItems,
}: ExceptionsManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [draft, setDraft] = useState<ExceptionDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.date.localeCompare(b.date)),
    [items],
  );

  function openCreate() {
    setError(null);
    setDraft(toDraft(null));
  }

  function openEdit(item: WorkingDayException) {
    setError(null);
    setDraft(toDraft(item));
  }

  function closeEditor() {
    if (isSubmitting) return;
    setDraft(null);
    setError(null);
  }

  async function handleSave() {
    if (!draft || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await upsertWorkingDayException(masterId, draft);
      if (!result.ok) {
        setError(result.message);
        setIsSubmitting(false);
        return;
      }

      setDraft(null);
      setIsSubmitting(false);
      router.refresh();
    } catch {
      setError("Не вдалося зберегти виняток.");
      setIsSubmitting(false);
    }
  }

  async function handleDelete(exceptionId: string) {
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await deleteWorkingDayException(masterId, exceptionId);
      if (!result.ok) {
        setError(result.message);
        setIsSubmitting(false);
        return;
      }

      setItems((current) => current.filter((item) => item.id !== exceptionId));
      if (draft?.id === exceptionId) setDraft(null);
      setIsSubmitting(false);
      router.refresh();
    } catch {
      setError("Не вдалося видалити виняток.");
      setIsSubmitting(false);
    }
  }

  if (draft) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={closeEditor}
          disabled={isSubmitting}
          className="text-sm text-muted-foreground disabled:opacity-60"
        >
          ← До списку
        </button>

        <h2 className="text-base font-semibold">
          {draft.id ? "Редагувати виняток" : "Додати виняток"}
        </h2>

        <label className="block">
          <span className="mb-1.5 block text-sm">Дата</span>
          <input
            type="date"
            value={draft.date}
            disabled={isSubmitting}
            onChange={(event) =>
              setDraft({ ...draft, date: event.target.value })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:border-foreground disabled:opacity-60"
          />
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
          <input
            type="checkbox"
            checked={draft.isDayOff}
            disabled={isSubmitting}
            onChange={(event) => {
              const isDayOff = event.target.checked;
              setDraft({
                ...draft,
                isDayOff,
                intervals: isDayOff
                  ? []
                  : draft.intervals.length > 0
                    ? draft.intervals
                    : [createExceptionInterval()],
              });
            }}
            className="h-5 w-5"
          />
          <span className="text-sm font-medium">Вихідний</span>
        </label>

        {!draft.isDayOff ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Інтервали
              </h3>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  setDraft({
                    ...draft,
                    intervals: [...draft.intervals, createExceptionInterval()],
                  })
                }
                className="text-sm font-medium disabled:opacity-60"
              >
                + Інтервал
              </button>
            </div>

            {draft.intervals.map((interval) => (
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
                      setDraft({
                        ...draft,
                        intervals: draft.intervals.map((item) =>
                          item.key === interval.key
                            ? { ...item, start: event.target.value }
                            : item,
                        ),
                      })
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
                      setDraft({
                        ...draft,
                        intervals: draft.intervals.map((item) =>
                          item.key === interval.key
                            ? { ...item, end: event.target.value }
                            : item,
                        ),
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base tabular-nums outline-none focus:border-foreground disabled:opacity-60"
                  />
                </label>
                <button
                  type="button"
                  disabled={isSubmitting || draft.intervals.length <= 1}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      intervals: draft.intervals.filter(
                        (item) => item.key !== interval.key,
                      ),
                    })
                  }
                  className="rounded-lg border border-border px-3 py-3 text-sm text-muted-foreground disabled:opacity-60"
                  aria-label="Видалити інтервал"
                >
                  ✕
                </button>
              </div>
            ))}
          </section>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => void handleSave()}
          className="w-full rounded-lg bg-primary px-4 py-3.5 text-base font-medium text-primary-foreground disabled:opacity-60"
        >
          {isSubmitting ? "Зберігаємо..." : "Зберегти"}
        </button>

        {draft.id ? (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => void handleDelete(draft.id!)}
            className="w-full rounded-lg border border-border px-4 py-3.5 text-base font-medium text-destructive disabled:opacity-60"
          >
            Видалити виняток
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={openCreate}
        className="w-full rounded-lg bg-primary px-4 py-3.5 text-base font-medium text-primary-foreground"
      >
        Додати виняток
      </button>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {sortedItems.length === 0 ? (
        <p className="rounded-xl border border-border px-4 py-8 text-center text-sm text-muted-foreground">
          Винятків поки немає.
        </p>
      ) : (
        <div className="space-y-3">
          {sortedItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openEdit(item)}
              className="block w-full rounded-xl border border-border bg-background px-4 py-4 text-left"
            >
              <p className="text-base font-semibold">
                {formatDateUk(item.date)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatExceptionSummary(item)}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
