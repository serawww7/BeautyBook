"use server";

import { createClient } from "@/lib/supabase/server";

export type CreateBookingInput = {
  salonId: string;
  masterId: string;
  serviceId: string;
  startsAt: string;
  endsAt: string;
  fullName: string;
  phone: string;
};

export type CreateBookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; code: "SLOT_TAKEN" | "VALIDATION" | "UNKNOWN"; message: string };

const SLOT_TAKEN_MESSAGE =
  "На жаль, цей час щойно став недоступним. Будь ласка, виберіть інший.";

export async function createBooking(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();

  if (!fullName || !phone || !input.startsAt || !input.endsAt) {
    return {
      ok: false,
      code: "VALIDATION",
      message: "Будь ласка, заповніть імʼя та телефон.",
    };
  }

  if (!/^[+\d\s()-]{7,20}$/.test(phone)) {
    return {
      ok: false,
      code: "VALIDATION",
      message: "Введіть коректний номер телефону.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("book_appointment", {
    p_salon_id: input.salonId,
    p_master_id: input.masterId,
    p_service_id: input.serviceId,
    p_starts_at: input.startsAt,
    p_ends_at: input.endsAt,
    p_full_name: fullName,
    p_phone: phone,
  });

  if (error) {
    const message = error.message ?? "";

    if (message.includes("SLOT_TAKEN") || message.includes("exclusion")) {
      return { ok: false, code: "SLOT_TAKEN", message: SLOT_TAKEN_MESSAGE };
    }

    return {
      ok: false,
      code: "UNKNOWN",
      message: "Не вдалося створити запис. Спробуйте ще раз.",
    };
  }

  return { ok: true, bookingId: data as string };
}
