"use client";

import { useState } from "react";

import { StatusBadge } from "@/components/admin/status-badge";
import {
  formatAdminDate,
  formatAdminTime,
  formatPrice,
} from "@/lib/admin/format";
import type { ClientHistoryItem } from "@/lib/admin/types";

const INITIAL_VISIBLE = 10;

type ClientBookingHistoryListProps = {
  bookings: ClientHistoryItem[];
  timeZone: string;
};

export function ClientBookingHistoryList({
  bookings,
  timeZone,
}: ClientBookingHistoryListProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? bookings : bookings.slice(0, INITIAL_VISIBLE);
  const hasMore = bookings.length > INITIAL_VISIBLE;

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">Історія записів</h2>

      <div className="space-y-2">
        {visible.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-border px-3 py-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {formatAdminDate(item.startsAt, timeZone)}
                  <span className="text-muted-foreground">
                    {" "}
                    · {formatAdminTime(item.startsAt, timeZone)}
                  </span>
                </p>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {item.serviceName} · {formatPrice(item.servicePrice)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <StatusBadge status={item.status} />
                {item.isCurrent ? (
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Поточний
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm font-medium"
        >
          Показати ще
        </button>
      ) : null}
    </section>
  );
}
