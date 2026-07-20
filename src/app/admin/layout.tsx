import Link from "next/link";
import type { ReactNode } from "react";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-10">
      <header className="space-y-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">BeautyBook</p>
            <h1 className="text-lg font-semibold tracking-tight">Кабінет</h1>
          </div>
          <Link
            href="/admin/new"
            className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
          >
            Новий запис
          </Link>
        </div>
        <nav className="flex gap-2 text-sm">
          <Link
            href="/admin"
            className="rounded-lg border border-border px-3 py-2 text-foreground"
          >
            Сьогодні
          </Link>
          <Link
            href="/admin/schedule"
            className="rounded-lg border border-border px-3 py-2 text-foreground"
          >
            Графік
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
