import { formatTimeLabel } from "@/lib/booking/datetime";

export function formatAdminTime(iso: string, timeZone: string): string {
  return formatTimeLabel(new Date(iso), timeZone);
}

export function formatAdminDate(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("uk-UA", {
    timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
  }).format(price);
}
