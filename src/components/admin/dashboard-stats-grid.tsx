import type { DashboardStats } from "@/lib/admin/dashboard";

type DashboardStatsGridProps = {
  stats: DashboardStats;
};

const ITEMS: { key: keyof DashboardStats; label: string }[] = [
  { key: "total", label: "Записів сьогодні" },
  { key: "confirmed", label: "Підтверджено" },
  { key: "pending", label: "Очікують" },
  { key: "completed", label: "Завершено" },
  { key: "cancelled", label: "Скасовано" },
  { key: "freeSlots", label: "Вільних слотів" },
];

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ITEMS.map((item) => (
        <div
          key={item.key}
          className="flex min-h-[88px] flex-col justify-between rounded-xl border border-border bg-background px-3 py-3"
        >
          <p className="text-xs leading-snug text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
            {stats[item.key]}
          </p>
        </div>
      ))}
    </div>
  );
}
