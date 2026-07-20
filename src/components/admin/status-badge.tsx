import type { BookingStatus } from "@/types/database";

const LABELS: Record<BookingStatus, string> = {
  pending: "Очікує",
  confirmed: "Підтверджено",
  cancelled: "Скасовано",
  completed: "Завершено",
};

const CLASS_NAMES: Record<BookingStatus, string> = {
  pending: "bg-status-pending text-status-pending-foreground",
  confirmed: "bg-status-confirmed text-status-confirmed-foreground",
  cancelled: "bg-status-cancelled text-status-cancelled-foreground",
  completed: "bg-status-completed text-status-completed-foreground",
};

type StatusBadgeProps = {
  status: BookingStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${CLASS_NAMES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
