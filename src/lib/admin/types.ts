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
};
