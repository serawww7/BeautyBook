import {
  normalizeTimeInput,
  type ScheduleIntervalDraft,
} from "@/lib/admin/schedule";

export type ExceptionTimeRange = {
  start_time: string;
  end_time: string;
};

export type WorkingDayException = {
  id: string;
  date: string;
  isDayOff: boolean;
  timeRanges: ExceptionTimeRange[];
};

export type ExceptionDraft = {
  id?: string;
  date: string;
  isDayOff: boolean;
  intervals: ScheduleIntervalDraft[];
};

function parseTimeToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function createExceptionInterval(): ScheduleIntervalDraft {
  return {
    key: `ex-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    start: "09:00",
    end: "13:00",
  };
}

export function validateExceptionDraft(
  draft: ExceptionDraft,
):
  | { ok: true; timeRanges: ExceptionTimeRange[] }
  | { ok: false; message: string } {
  if (!draft.date) {
    return { ok: false, message: "Оберіть дату." };
  }

  if (draft.isDayOff) {
    return { ok: true, timeRanges: [] };
  }

  if (draft.intervals.length === 0) {
    return {
      ok: false,
      message: "Додайте хоча б один інтервал або позначте вихідний.",
    };
  }

  const timeRanges: ExceptionTimeRange[] = [];

  for (const interval of draft.intervals) {
    const start = normalizeTimeInput(interval.start);
    const end = normalizeTimeInput(interval.end);

    if (!start || !end) {
      return { ok: false, message: "Заповніть усі поля часу." };
    }

    const startMinutes = parseTimeToMinutes(start);
    const endMinutes = parseTimeToMinutes(end);

    if (startMinutes === null || endMinutes === null) {
      return { ok: false, message: "Некоректний формат часу." };
    }

    if (endMinutes <= startMinutes) {
      return {
        ok: false,
        message: "Час завершення має бути пізніше початку.",
      };
    }

    timeRanges.push({ start_time: start, end_time: end });
  }

  const sorted = [...timeRanges]
    .map((range) => ({
      start: parseTimeToMinutes(range.start_time)!,
      end: parseTimeToMinutes(range.end_time)!,
    }))
    .sort((a, b) => a.start - b.start);

  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].start < sorted[i - 1].end) {
      return { ok: false, message: "Інтервали не повинні перетинатися." };
    }
  }

  return { ok: true, timeRanges };
}

export function formatExceptionSummary(item: WorkingDayException): string {
  if (item.isDayOff) return "Вихідний";
  return item.timeRanges
    .map(
      (range) =>
        `${normalizeTimeInput(range.start_time)}–${normalizeTimeInput(range.end_time)}`,
    )
    .join(", ");
}
