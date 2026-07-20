export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type Database = {
  public: {
    Tables: {
      salons: {
        Row: {
          id: string;
          name: string;
          slug: string;
          timezone: string;
          created_at: string;
        };
      };
      masters: {
        Row: {
          id: string;
          salon_id: string;
          auth_user_id: string | null;
          display_name: string;
          is_active: boolean;
          created_at: string;
        };
      };
      clients: {
        Row: {
          id: string;
          auth_user_id: string | null;
          full_name: string;
          phone: string;
          email: string | null;
          created_at: string;
        };
      };
      services: {
        Row: {
          id: string;
          master_id: string;
          name: string;
          duration_minutes: number;
          price: number;
          is_active: boolean;
          created_at: string;
        };
      };
      working_hours: {
        Row: {
          id: string;
          master_id: string;
          weekday: number;
          start_time: string;
          end_time: string;
        };
      };
      working_day_exceptions: {
        Row: {
          id: string;
          master_id: string;
          date: string;
          is_day_off: boolean;
          time_ranges: { start_time: string; end_time: string }[];
          created_at: string;
          updated_at: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          salon_id: string;
          master_id: string;
          client_id: string;
          service_id: string;
          starts_at: string;
          ends_at: string;
          status: BookingStatus;
          notes: string | null;
          created_at: string;
        };
      };
    };
    Functions: {
      book_appointment: {
        Args: {
          p_salon_id: string;
          p_master_id: string;
          p_service_id: string;
          p_starts_at: string;
          p_ends_at: string;
          p_full_name: string;
          p_phone: string;
        };
        Returns: string;
      };
      admin_list_today_bookings: {
        Args: { p_master_id: string };
        Returns: {
          id: string;
          starts_at: string;
          ends_at: string;
          status: BookingStatus;
          notes: string | null;
          client_name: string;
          client_phone: string;
          service_name: string;
          service_price: number;
        }[];
      };
      admin_get_booking: {
        Args: { p_booking_id: string };
        Returns: {
          id: string;
          starts_at: string;
          ends_at: string;
          status: BookingStatus;
          notes: string | null;
          client_name: string;
          client_phone: string;
          service_name: string;
          service_price: number;
          salon_timezone: string;
          salon_id: string;
          master_id: string;
          service_id: string;
          service_duration_minutes: number;
        }[];
      };
      admin_reschedule_booking: {
        Args: {
          p_booking_id: string;
          p_starts_at: string;
          p_ends_at: string;
        };
        Returns: string;
      };
      admin_update_booking_status: {
        Args: { p_booking_id: string; p_status: BookingStatus };
        Returns: string;
      };
      admin_find_client_by_phone: {
        Args: { p_phone: string };
        Returns: {
          id: string;
          full_name: string;
          phone: string;
        }[];
      };
      admin_save_working_hours: {
        Args: {
          p_master_id: string;
          p_intervals: {
            weekday: number;
            start_time: string;
            end_time: string;
          }[];
        };
        Returns: null;
      };
      admin_list_services: {
        Args: { p_master_id: string };
        Returns: {
          id: string;
          name: string;
          duration_minutes: number;
          price: number;
          is_active: boolean;
          created_at: string;
          used_in_bookings: boolean;
        }[];
      };
      admin_upsert_service: {
        Args: {
          p_master_id: string;
          p_name: string;
          p_duration_minutes: number;
          p_price: number;
          p_is_active: boolean;
          p_id?: string | null;
        };
        Returns: string;
      };
      admin_hide_service: {
        Args: { p_id: string; p_master_id: string };
        Returns: string;
      };
      admin_delete_service: {
        Args: { p_id: string; p_master_id: string };
        Returns: null;
      };
      admin_upsert_working_day_exception: {
        Args: {
          p_master_id: string;
          p_date: string;
          p_is_day_off: boolean;
          p_time_ranges: { start_time: string; end_time: string }[];
          p_id?: string | null;
        };
        Returns: string;
      };
      admin_delete_working_day_exception: {
        Args: { p_id: string; p_master_id: string };
        Returns: null;
      };
    };
    Enums: {
      booking_status: BookingStatus;
    };
  };
};
