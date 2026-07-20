"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  deleteService,
  hideService,
  upsertService,
} from "@/app/actions/services";
import type { MasterService, ServiceDraft } from "@/lib/admin/services";

type ServiceFormProps = {
  masterId: string;
  initial?: MasterService | null;
};

export function ServiceForm({ masterId, initial }: ServiceFormProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<ServiceDraft>({
    id: initial?.id,
    name: initial?.name ?? "",
    durationMinutes: initial ? String(initial.durationMinutes) : "30",
    price: initial ? String(initial.price) : "",
    isActive: initial?.isActive ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = Boolean(initial?.id);
  const usedInBookings = Boolean(initial?.usedInBookings);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await upsertService(masterId, draft);
      if (!result.ok) {
        setError(result.message);
        setIsSubmitting(false);
        return;
      }

      router.replace("/admin/services");
      router.refresh();
    } catch {
      setError("Не вдалося зберегти послугу.");
      setIsSubmitting(false);
    }
  }

  async function handleHide() {
    if (!draft.id || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await hideService(masterId, draft.id);
      if (!result.ok) {
        setError(result.message);
        setIsSubmitting(false);
        return;
      }
      router.replace("/admin/services");
      router.refresh();
    } catch {
      setError("Не вдалося приховати послугу.");
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!draft.id || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await deleteService(masterId, draft.id);
      if (!result.ok) {
        setError(result.message);
        setIsSubmitting(false);
        return;
      }
      router.replace("/admin/services");
      router.refresh();
    } catch {
      setError("Не вдалося видалити послугу.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="mb-1.5 block text-sm">Назва</span>
        <input
          required
          value={draft.name}
          disabled={isSubmitting}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:border-foreground disabled:opacity-60"
          placeholder="Наприклад, Стрижка"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm">Тривалість (хв)</span>
        <input
          required
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          value={draft.durationMinutes}
          disabled={isSubmitting}
          onChange={(event) =>
            setDraft({ ...draft, durationMinutes: event.target.value })
          }
          className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:border-foreground disabled:opacity-60"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm">Ціна (грн)</span>
        <input
          required
          type="number"
          min={1}
          step="1"
          inputMode="decimal"
          value={draft.price}
          disabled={isSubmitting}
          onChange={(event) => setDraft({ ...draft, price: event.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-3 text-base outline-none focus:border-foreground disabled:opacity-60"
        />
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
        <input
          type="checkbox"
          checked={draft.isActive}
          disabled={isSubmitting}
          onChange={(event) =>
            setDraft({ ...draft, isActive: event.target.checked })
          }
          className="h-5 w-5"
        />
        <span className="text-sm font-medium">Активна (видима для клієнтів)</span>
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
        {isSubmitting ? "Зберігаємо..." : "Зберегти"}
      </button>

      {isEdit ? (
        <div className="space-y-3 pt-2">
          {draft.isActive ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleHide()}
              className="w-full rounded-lg border border-border px-4 py-3.5 text-base font-medium disabled:opacity-60"
            >
              Приховати
            </button>
          ) : null}

          {!usedInBookings ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleDelete()}
              className="w-full rounded-lg border border-border px-4 py-3.5 text-base font-medium text-destructive disabled:opacity-60"
            >
              Видалити
            </button>
          ) : (
            <p className="text-xs text-muted-foreground">
              Послуга вже є в записах — фізичне видалення недоступне, можна
              приховати.
            </p>
          )}
        </div>
      ) : null}
    </form>
  );
}
