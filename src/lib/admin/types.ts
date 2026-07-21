import type { BookingStatus } from "@/types/database";

export type AdminBookingListItem = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  notes: string | null;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  servicePrice: number;
};

export type AdminBookingDetail = AdminBookingListItem & {
  salonTimezone: string;
  salonId: string;
  masterId: string;
  serviceId: string;
  serviceDurationMinutes: number;
};

export type ClientHistoryItem = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  serviceName: string;
  servicePrice: number;
  isCurrent: boolean;
};

export type ClientBookingHistory = {
  firstVisitAt: string | null;
  lastBookingAt: string | null;
  totalCount: number;
  completedCount: number;
  cancelledCount: number;
  bookings: ClientHistoryItem[];
};
