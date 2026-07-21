import Link from "next/link";

import { ServiceForm } from "@/components/admin/service-form";
import { getAdminContext } from "@/lib/admin/queries";
import { DEMO_SALON_SLUG } from "@/lib/tenant/config";

export default async function AdminNewServicePage() {
  const context = await getAdminContext({ salonSlug: DEMO_SALON_SLUG });

  if (!context) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        Дані салону ще не налаштовані.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <Link href="/admin/services" className="text-sm text-muted-foreground">
        ← До послуг
      </Link>
      <h2 className="text-base font-semibold">Нова послуга</h2>
      <ServiceForm masterId={context.master.id} />
    </div>
  );
}
