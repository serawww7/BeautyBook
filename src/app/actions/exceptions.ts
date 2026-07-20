"use server";

import {
  validateExceptionDraft,
  type ExceptionDraft,
} from "@/lib/admin/exceptions";
import { createClient } from "@/lib/supabase/server";

export type ExceptionActionResult =
  | { ok: true; id?: string }
  | { ok: false; message: string };

export async function upsertWorkingDayException(
  masterId: string,
  draft: ExceptionDraft,
): Promise<ExceptionActionResult> {
  const validation = validateExceptionDraft(draft);
  if (!validation.ok) {
    return validation;
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "admin_upsert_working_day_exception",
    {
      p_master_id: masterId,
      p_date: draft.date,
      p_is_day_off: draft.isDayOff,
      p_time_ranges: validation.timeRanges,
      p_id: draft.id ?? null,
    },
  );

  if (error) {
    const message = error.message ?? "";
    if (message.includes("DUPLICATE_DATE")) {
      return { ok: false, message: "Для цієї дати виняток уже існує." };
    }
    if (message.includes("INTERVAL_OVERLAP")) {
      return { ok: false, message: "Інтервали не повинні перетинатися." };
    }
    if (message.includes("INVALID_TIME_ORDER")) {
      return {
        ok: false,
        message: "Час завершення має бути пізніше початку.",
      };
    }
    if (message.includes("EMPTY_INTERVAL")) {
      return { ok: false, message: "Заповніть усі поля часу." };
    }
    return { ok: false, message: "Не вдалося зберегти виняток." };
  }

  return { ok: true, id: data as string };
}

export async function deleteWorkingDayException(
  masterId: string,
  exceptionId: string,
): Promise<ExceptionActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("admin_delete_working_day_exception", {
    p_id: exceptionId,
    p_master_id: masterId,
  });

  if (error) {
    return { ok: false, message: "Не вдалося видалити виняток." };
  }

  return { ok: true };
}
