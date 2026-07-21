import Link from "next/link";
import { notFound } from "next/navigation";

import { ServiceForm } from "@/components/admin/service-form";
import { getAdminContext, getMasterService } from "@/lib/admin/queries";
import { DEMO_SALON_SLUG } from "@/lib/tenant/config";

type EditServicePageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditServicePage({
  params,
}: EditServicePageProps) {
  const { id } = await params;
  const context = await getAdminContext({ salonSlug: DEMO_SALON_SLUG });

  if (!context) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        Дані салону ще не налаштовані.
      </p>
    );
  }

  const service = await getMasterService(context.master.id, id);
  if (!service) {
    notFound();
  }

  return (
    <div className="mt-4 space-y-4">
      <Link href="/admin/services" className="text-sm text-muted-foreground">
        ← До послуг
      </Link>
      <h2 className="text-base font-semibold">Редагувати послугу</h2>
      <ServiceForm masterId={context.master.id} initial={service} />
    </div>
  );
}
