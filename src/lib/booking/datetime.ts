const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export type DateParts = {
  year: number;
  month: number;
  day: number;
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function getZonedParts(date: Date, timeZone: string): DateParts & {
  hour: number;
  minute: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "0";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

export function addCalendarDays(parts: DateParts, days: number): DateParts {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

export function getWeekdayInTimeZone(parts: DateParts, timeZone: string): number {
  const noon = zonedLocalToUtc(parts.year, parts.month, parts.day, 12, 0, timeZone);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(noon);

  return WEEKDAY_MAP[weekday] ?? 0;
}

/** Convert salon local wall time → UTC Date */
export function zonedLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = Object.fromEntries(
    dtf
      .formatToParts(utcDate)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return new Date(utcDate.getTime() - (asUtc - utcDate.getTime()));
}

export function formatDateKey(parts: DateParts): string {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

export function formatTimeLabel(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("uk-UA", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

function capitalizeUk(value: string): string {
  if (!value) return value;
  return value.charAt(0).toLocaleUpperCase("uk-UA") + value.slice(1);
}

/** Сьогодні / Завтра / назва дня тижня (у TZ салону) */
export function formatDayTitle(
  offset: number,
  parts: DateParts,
  timeZone: string,
): string {
  if (offset === 0) return "Сьогодні";
  if (offset === 1) return "Завтра";

  const noon = zonedLocalToUtc(parts.year, parts.month, parts.day, 12, 0, timeZone);
  const weekday = new Intl.DateTimeFormat("uk-UA", {
    timeZone,
    weekday: "long",
  }).format(noon);

  return capitalizeUk(weekday);
}

/** Напр. «21 липня» у TZ салону */
export function formatDateLabel(parts: DateParts, timeZone: string): string {
  const noon = zonedLocalToUtc(parts.year, parts.month, parts.day, 12, 0, timeZone);
  return new Intl.DateTimeFormat("uk-UA", {
    timeZone,
    day: "numeric",
    month: "long",
  }).format(noon);
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
