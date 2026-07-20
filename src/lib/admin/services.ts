export type MasterService = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
  createdAt: string;
  usedInBookings: boolean;
};

export type ServiceDraft = {
  id?: string;
  name: string;
  durationMinutes: string;
  price: string;
  isActive: boolean;
};

export function validateServiceDraft(
  draft: ServiceDraft,
):
  | {
      ok: true;
      name: string;
      durationMinutes: number;
      price: number;
      isActive: boolean;
    }
  | { ok: false; message: string } {
  const name = draft.name.trim();
  if (!name) {
    return { ok: false, message: "Вкажіть назву послуги." };
  }

  const durationMinutes = Number(draft.durationMinutes);
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return {
      ok: false,
      message: "Тривалість має бути більшою за 0 хвилин.",
    };
  }

  if (!Number.isInteger(durationMinutes)) {
    return { ok: false, message: "Тривалість має бути цілим числом хвилин." };
  }

  const price = Number(draft.price.replace(",", "."));
  if (!Number.isFinite(price) || price <= 0) {
    return { ok: false, message: "Ціна має бути більшою за 0." };
  }

  return {
    ok: true,
    name,
    durationMinutes,
    price,
    isActive: draft.isActive,
  };
}
