"use server";

import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/types/database";

export type UpdateBookingStatusResult =
  | { ok: true }
  | { ok: false; message: string };

export type FindClientResult =
  | { ok: true; client: { id: string; fullName: string; phone: string } | null }
  | { ok: false; message: string };

const ALLOWED_STATUSES: BookingStatus[] = [
  "confirmed",
  "cancelled",
  "completed",
];

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Promise<UpdateBookingStatusResult> {
  if (!ALLOWED_STATUSES.includes(status)) {
    return { ok: false, message: "Недопустимий статус." };
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("admin_update_booking_status", {
    p_booking_id: bookingId,
    p_status: status,
  });

  if (error) {
    return { ok: false, message: "Не вдалося змінити статус." };
  }

  return { ok: true };
}

export async function findClientByPhone(
  phone: string,
): Promise<FindClientResult> {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { ok: true, client: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("admin_find_client_by_phone", {
    p_phone: trimmed,
  });

  if (error) {
    return { ok: false, message: "Не вдалося знайти клієнта." };
  }

  const row = (
    data as { id: string; full_name: string; phone: string }[] | null
  )?.[0];
  if (!row) {
    return { ok: true, client: null };
  }

  return {
    ok: true,
    client: {
      id: row.id,
      fullName: row.full_name,
      phone: row.phone,
    },
  };
}
