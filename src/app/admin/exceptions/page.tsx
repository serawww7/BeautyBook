import Link from "next/link";

import { ExceptionsManager } from "@/components/admin/exceptions-manager";
import {
  getAdminContext,
  getWorkingDayExceptions,
} from "@/lib/admin/queries";
import { DEMO_SALON_SLUG } from "@/lib/tenant/config";

export default async function AdminExceptionsPage() {
  const context = await getAdminContext({ salonSlug: DEMO_SALON_SLUG });

  if (!context) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        Дані салону ще не налаштовані.
      </p>
    );
  }

  const items = await getWorkingDayExceptions(context.master.id);

  return (
    <div className="mt-4 space-y-4">
      <Link href="/admin" className="text-sm text-muted-foreground">
        ← До записів
      </Link>
      <div>
        <h2 className="text-base font-semibold">Винятки</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Окремі дати з пріоритетом над тижневим графіком
        </p>
      </div>
      <ExceptionsManager
        masterId={context.master.id}
        initialItems={items}
      />
    </div>
  );
}
