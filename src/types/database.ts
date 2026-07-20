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
    };
    Enums: {
      booking_status: BookingStatus;
    };
  };
};
