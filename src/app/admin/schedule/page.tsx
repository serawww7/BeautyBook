import Link from "next/link";

import { ScheduleEditor } from "@/components/admin/schedule-editor";
import { getAdminContext, getWorkingHours } from "@/lib/admin/queries";
import { buildScheduleDays } from "@/lib/admin/schedule";

export default async function AdminSchedulePage() {
  const context = await getAdminContext("marina");

  if (!context) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        Дані салону ще не налаштовані.
      </p>
    );
  }

  const rows = await getWorkingHours(context.master.id);
  const initialDays = buildScheduleDays(rows);

  return (
    <div className="mt-4 space-y-4">
      <Link href="/admin" className="text-sm text-muted-foreground">
        ← До записів
      </Link>
      <div>
        <h2 className="text-base font-semibold">Графік роботи</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Типовий тижневий розклад для {context.master.displayName}
        </p>
      </div>
      <ScheduleEditor masterId={context.master.id} initialDays={initialDays} />
    </div>
  );
}
