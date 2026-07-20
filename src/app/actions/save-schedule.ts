"use server";

import { validateScheduleDays, type ScheduleDayDraft } from "@/lib/admin/schedule";
import { createClient } from "@/lib/supabase/server";

export type SaveScheduleResult =
  | { ok: true }
  | { ok: false; message: string };

export async function saveWorkingHours(
  masterId: string,
  days: ScheduleDayDraft[],
): Promise<SaveScheduleResult> {
  const validation = validateScheduleDays(days);
  if (!validation.ok) {
    return validation;
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("admin_save_working_hours", {
    p_master_id: masterId,
    p_intervals: validation.intervals,
  });

  if (error) {
    const message = error.message ?? "";

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

    return { ok: false, message: "Не вдалося зберегти графік." };
  }

  return { ok: true };
}
