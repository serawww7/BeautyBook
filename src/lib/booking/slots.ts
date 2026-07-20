import {
  addCalendarDays,
  formatDateKey,
  formatDayHeading,
  formatTimeLabel,
  getWeekdayInTimeZone,
  getZonedParts,
  parseTimeToMinutes,
  zonedLocalToUtc,
  type DateParts,
} from "./datetime";

export type WorkingHourRow = {
  weekday: number;
  start_time: string;
  end_time: string;
};

export type BookingInterval = {
  starts_at: string;
  ends_at: string;
};

export type TimeSlot = {
  startsAt: string;
  endsAt: string;
  label: string;
};

export type DaySlots = {
  dateKey: string;
  heading: string;
  slots: TimeSlot[];
};

function rangesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return startA < endB && endA > startB;
}

export function buildAvailableDays(params: {
  timeZone: string;
  durationMinutes: number;
  workingHours: WorkingHourRow[];
  bookings: BookingInterval[];
  dayCount?: number;
  now?: Date;
}): DaySlots[] {
  const {
    timeZone,
    durationMinutes,
    workingHours,
    bookings,
    dayCount = 7,
    now = new Date(),
  } = params;

  const today = getZonedParts(now, timeZone);
  const busy = bookings.map((booking) => ({
    start: new Date(booking.starts_at).getTime(),
    end: new Date(booking.ends_at).getTime(),
  }));

  const days: DaySlots[] = [];

  for (let offset = 0; offset < dayCount; offset += 1) {
    const parts: DateParts = addCalendarDays(today, offset);
    const weekday = getWeekdayInTimeZone(parts, timeZone);
    const intervals = workingHours.filter((row) => row.weekday === weekday);

    if (intervals.length === 0) continue;

    const slots: TimeSlot[] = [];

    for (const interval of intervals) {
      const startMinutes = parseTimeToMinutes(interval.start_time);
      const endMinutes = parseTimeToMinutes(interval.end_time);

      for (
        let cursor = startMinutes;
        cursor + durationMinutes <= endMinutes;
        cursor += durationMinutes
      ) {
        const hour = Math.floor(cursor / 60);
        const minute = cursor % 60;
        const startsAt = zonedLocalToUtc(
          parts.year,
          parts.month,
          parts.day,
          hour,
          minute,
          timeZone,
        );
        const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);

        if (startsAt.getTime() <= now.getTime()) continue;

        const overlaps = busy.some((booking) =>
          rangesOverlap(
            startsAt.getTime(),
            endsAt.getTime(),
            booking.start,
            booking.end,
          ),
        );

        if (overlaps) continue;

        slots.push({
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          label: formatTimeLabel(startsAt, timeZone),
        });
      }
    }

    if (slots.length === 0) continue;

    days.push({
      dateKey: formatDateKey(parts),
      heading: formatDayHeading(offset, parts),
      slots,
    });
  }

  return days;
}
