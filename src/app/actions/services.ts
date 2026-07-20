"use server";

import {
  validateServiceDraft,
  type ServiceDraft,
} from "@/lib/admin/services";
import { createClient } from "@/lib/supabase/server";

export type ServiceActionResult =
  | { ok: true; id?: string }
  | { ok: false; message: string };

export async function upsertService(
  masterId: string,
  draft: ServiceDraft,
): Promise<ServiceActionResult> {
  const validation = validateServiceDraft(draft);
  if (!validation.ok) {
    return validation;
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("admin_upsert_service", {
    p_master_id: masterId,
    p_name: validation.name,
    p_duration_minutes: validation.durationMinutes,
    p_price: validation.price,
    p_is_active: validation.isActive,
    p_id: draft.id ?? null,
  });

  if (error) {
    const message = error.message ?? "";
    if (message.includes("INVALID_NAME")) {
      return { ok: false, message: "Вкажіть назву послуги." };
    }
    if (message.includes("INVALID_DURATION")) {
      return {
        ok: false,
        message: "Тривалість має бути більшою за 0 хвилин.",
      };
    }
    if (message.includes("INVALID_PRICE")) {
      return { ok: false, message: "Ціна має бути більшою за 0." };
    }
    return { ok: false, message: "Не вдалося зберегти послугу." };
  }

  return { ok: true, id: data as string };
}

export async function hideService(
  masterId: string,
  serviceId: string,
): Promise<ServiceActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("admin_hide_service", {
    p_id: serviceId,
    p_master_id: masterId,
  });

  if (error) {
    return { ok: false, message: "Не вдалося приховати послугу." };
  }

  return { ok: true };
}

export async function deleteService(
  masterId: string,
  serviceId: string,
): Promise<ServiceActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("admin_delete_service", {
    p_id: serviceId,
    p_master_id: masterId,
  });

  if (error) {
    const message = error.message ?? "";
    if (message.includes("SERVICE_IN_USE")) {
      return {
        ok: false,
        message:
          "Послугу вже використовували в записах. Можна лише приховати.",
      };
    }
    return { ok: false, message: "Не вдалося видалити послугу." };
  }

  return { ok: true };
}
