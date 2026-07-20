import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/types/database";

import type { AdminBookingDetail, AdminBookingListItem } from "./types";

type TodayBookingRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  notes: string | null;
  client_name: string;
  client_phone: string;
  service_name: string;
  service_price: number;
};

type BookingDetailRow = TodayBookingRow & {
  salon_timezone: string;
  salon_id: string;
  master_id: string;
  service_id: string;
  service_duration_minutes: number;
};

export async function getAdminContext(slug = "marina") {
  const supabase = await createClient();

  const { data: salon } = await supabase
    .from("salons")
    .select("id, name, slug, timezone")
    .eq("slug", slug)
    .maybeSingle();

  if (!salon) return null;

  const { data: master } = await supabase
    .from("masters")
    .select("id, display_name")
    .eq("salon_id", salon.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!master) return null;

  const { data: service } = await supabase
    .from("services")
    .select("id, name, duration_minutes, price")
    .eq("master_id", master.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!service) return null;

  return {
    salon: {
      id: salon.id,
      name: salon.name,
      slug: salon.slug,
      timezone: salon.timezone,
    },
    master: {
      id: master.id,
      displayName: master.display_name,
    },
    service: {
      id: service.id,
      name: service.name,
      durationMinutes: service.duration_minutes,
      price: Number(service.price),
    },
  };
}

export async function getTodayBookings(
  masterId: string,
): Promise<AdminBookingListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("admin_list_today_bookings", {
    p_master_id: masterId,
  });

  if (error || !data) return [];

  return (data as TodayBookingRow[]).map((row) => ({
    id: row.id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    notes: row.notes,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    serviceName: row.service_name,
    servicePrice: Number(row.service_price),
  }));
}

export async function getBookingDetail(
  bookingId: string,
): Promise<AdminBookingDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("admin_get_booking", {
    p_booking_id: bookingId,
  });

  if (error || !data?.[0]) return null;

  const row = data[0] as BookingDetailRow;

  return {
    id: row.id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    notes: row.notes,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    serviceName: row.service_name,
    servicePrice: Number(row.service_price),
    salonTimezone: row.salon_timezone,
    salonId: row.salon_id,
    masterId: row.master_id,
    serviceId: row.service_id,
    serviceDurationMinutes: row.service_duration_minutes,
  };
}

export async function getWorkingHours(masterId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("working_hours")
    .select("weekday, start_time, end_time")
    .eq("master_id", masterId)
    .order("weekday", { ascending: true })
    .order("start_time", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    weekday: row.weekday as number,
    start_time: row.start_time as string,
    end_time: row.end_time as string,
  }));
}

export async function getWorkingDayExceptions(masterId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("working_day_exceptions")
    .select("id, date, is_day_off, time_ranges")
    .eq("master_id", masterId)
    .order("date", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    date: row.date as string,
    isDayOff: Boolean(row.is_day_off),
    timeRanges: Array.isArray(row.time_ranges)
      ? (row.time_ranges as { start_time: string; end_time: string }[])
      : [],
  }));
}

export async function getMasterServices(masterId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("admin_list_services", {
    p_master_id: masterId,
  });

  if (error || !data) return [];

  return (
    data as {
      id: string;
      name: string;
      duration_minutes: number;
      price: number;
      is_active: boolean;
      created_at: string;
      used_in_bookings: boolean;
    }[]
  ).map((row) => ({
    id: row.id,
    name: row.name,
    durationMinutes: row.duration_minutes,
    price: Number(row.price),
    isActive: row.is_active,
    createdAt: row.created_at,
    usedInBookings: row.used_in_bookings,
  }));
}

export async function getMasterService(masterId: string, serviceId: string) {
  const services = await getMasterServices(masterId);
  return services.find((service) => service.id === serviceId) ?? null;
}
