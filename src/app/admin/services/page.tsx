import Link from "next/link";

import { formatPrice } from "@/lib/admin/format";
import { getAdminContext, getMasterServices } from "@/lib/admin/queries";
import { DEMO_SALON_SLUG } from "@/lib/tenant/config";

export default async function AdminServicesPage() {
  const context = await getAdminContext({ salonSlug: DEMO_SALON_SLUG });

  if (!context) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        Дані салону ще не налаштовані.
      </p>
    );
  }

  const services = await getMasterServices(context.master.id);

  return (
    <div className="mt-4 space-y-4">
      <Link href="/admin" className="text-sm text-muted-foreground">
        ← До записів
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Послуги</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Керування прайсом майстра
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          Додати
        </Link>
      </div>

      {services.length === 0 ? (
        <p className="rounded-xl border border-border px-4 py-8 text-center text-sm text-muted-foreground">
          Послуг ще немає.
        </p>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/admin/services/${service.id}`}
              className="block rounded-xl border border-border bg-background px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-base font-semibold">{service.name}</p>
                <span
                  className={
                    service.isActive
                      ? "rounded-md bg-status-confirmed px-2 py-1 text-xs font-medium text-status-confirmed-foreground"
                      : "rounded-md bg-status-cancelled px-2 py-1 text-xs font-medium text-status-cancelled-foreground"
                  }
                >
                  {service.isActive ? "Активна" : "Прихована"}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {service.durationMinutes} хв · {formatPrice(service.price)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
