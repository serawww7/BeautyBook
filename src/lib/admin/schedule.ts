/** JS getDay() / DB weekday: 0 = Sunday … 6 = Saturday */
export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export const WEEKDAY_LABELS: Record<number, string> = {
  0: "Неділя",
  1: "Понеділок",
  2: "Вівторок",
  3: "Середа",
  4: "Четвер",
  5: "Пʼятниця",
  6: "Субота",
};

export type ScheduleIntervalDraft = {
  key: string;
  start: string;
  end: string;
};

export type ScheduleDayDraft = {
  weekday: number;
  label: string;
  intervals: ScheduleIntervalDraft[];
};

export type ScheduleIntervalInput = {
  weekday: number;
  start_time: string;
  end_time: string;
};

function parseTimeToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function normalizeTimeInput(value: string): string {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value.trim());
  if (!match) return value.trim();
  return `${String(Number(match[1])).padStart(2, "0")}:${match[2]}`;
}

export function validateScheduleDays(
  days: ScheduleDayDraft[],
): { ok: true; intervals: ScheduleIntervalInput[] } | { ok: false; message: string } {
  const intervals: ScheduleIntervalInput[] = [];

  for (const day of days) {
    for (const interval of day.intervals) {
      const start = normalizeTimeInput(interval.start);
      const end = normalizeTimeInput(interval.end);

      if (!start || !end) {
        return {
          ok: false,
          message: `${day.label}: заповніть початок і кінець інтервалу.`,
        };
      }

      const startMinutes = parseTimeToMinutes(start);
      const endMinutes = parseTimeToMinutes(end);

      if (startMinutes === null || endMinutes === null) {
        return {
          ok: false,
          message: `${day.label}: некоректний формат часу.`,
        };
      }

      if (endMinutes <= startMinutes) {
        return {
          ok: false,
          message: `${day.label}: час завершення має бути пізніше початку.`,
        };
      }

      intervals.push({
        weekday: day.weekday,
        start_time: start,
        end_time: end,
      });
    }

    const dayIntervals = intervals
      .filter((item) => item.weekday === day.weekday)
      .map((item) => ({
        start: parseTimeToMinutes(item.start_time)!,
        end: parseTimeToMinutes(item.end_time)!,
      }))
      .sort((a, b) => a.start - b.start);

    for (let i = 1; i < dayIntervals.length; i += 1) {
      if (dayIntervals[i].start < dayIntervals[i - 1].end) {
        return {
          ok: false,
          message: `${day.label}: інтервали перетинаються.`,
        };
      }
    }
  }

  return { ok: true, intervals };
}

export function buildScheduleDays(
  rows: { weekday: number; start_time: string; end_time: string }[],
): ScheduleDayDraft[] {
  return WEEKDAY_ORDER.map((weekday) => ({
    weekday,
    label: WEEKDAY_LABELS[weekday],
    intervals: rows
      .filter((row) => row.weekday === weekday)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
      .map((row, index) => ({
        key: `${weekday}-${index}-${row.start_time}`,
        start: normalizeTimeInput(row.start_time),
        end: normalizeTimeInput(row.end_time),
      })),
  }));
}

export function createEmptyInterval(weekday: number): ScheduleIntervalDraft {
  return {
    key: `${weekday}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    start: "09:00",
    end: "13:00",
  };
}
