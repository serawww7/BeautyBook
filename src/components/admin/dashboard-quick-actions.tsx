import Link from "next/link";

const ACTIONS = [
  { href: "/admin/new", label: "Новий запис", primary: true },
  { href: "/admin/services", label: "Послуги", primary: false },
  { href: "/admin/schedule", label: "Графік", primary: false },
  { href: "/admin/exceptions", label: "Винятки", primary: false },
] as const;

export function DashboardQuickActions() {
  return (
    <div className="grid gap-3">
      {ACTIONS.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={
            action.primary
              ? "flex min-h-[52px] items-center justify-center rounded-xl bg-primary px-4 py-3.5 text-base font-medium text-primary-foreground"
              : "flex min-h-[52px] items-center justify-center rounded-xl border border-border bg-background px-4 py-3.5 text-base font-medium text-foreground"
          }
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
}
