import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/types/database";
import {
  resolveTenantContext,
  type TenantContext,
} from "@/lib/tenant/context";
import { DEMO_SALON_SLUG, type TenantScope } from "@/lib/tenant/config";

import type {
  AdminBookingDetail,
  AdminBookingListItem,
  ClientBookingHistory,
} from "./types";

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

/** @deprecated Prefer resolveTenantContext — kept as admin alias with service key. */
export type AdminContext = {
  salon: TenantContext["salon"];
  master: {
    id: string;
    displayName: string;
  };
  service: TenantContext["primaryService"];
};

export async function getAdminContext(
  scope: TenantScope | string = { salonSlug: DEMO_SALON_SLUG },
): Promise<AdminContext | null> {
  const normalized: TenantScope =
    typeof scope === "string" ? { salonSlug: scope } : scope;

  const context = await resolveTenantContext(normalized);
  if (!context) return null;

  return {
    salon: context.salon,
    master: {
      id: context.master.id,
      displayName: context.master.displayName,
    },
    service: context.primaryService,
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
  masterId: string,
): Promise<AdminBookingDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("admin_get_booking", {
    p_booking_id: bookingId,
    p_master_id: masterId,
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

export async function getClientBookingHistory(
  bookingId: string,
  masterId: string,
): Promise<ClientBookingHistory | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "admin_get_client_booking_history",
    {
      p_booking_id: bookingId,
      p_master_id: masterId,
    },
  );

  if (error || !data) return null;

  const row = data as {
    first_visit_at: string | null;
    last_booking_at: string | null;
    total_count: number;
    completed_count: number;
    cancelled_count: number;
    bookings:
      | {
          id: string;
          starts_at: string;
          ends_at: string;
          status: BookingStatus;
          service_name: string;
          service_price: number;
          is_current: boolean;
        }[]
      | null;
  };

  return {
    firstVisitAt: row.first_visit_at,
    lastBookingAt: row.last_booking_at,
    totalCount: Number(row.total_count ?? 0),
    completedCount: Number(row.completed_count ?? 0),
    cancelledCount: Number(row.cancelled_count ?? 0),
    bookings: (row.bookings ?? []).map((item) => ({
      id: item.id,
      startsAt: item.starts_at,
      endsAt: item.ends_at,
      status: item.status,
      serviceName: item.service_name,
      servicePrice: Number(item.service_price),
      isCurrent: Boolean(item.is_current),
    })),
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
