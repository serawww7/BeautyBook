"use client";

import { useCallback } from "react";

export default function OfflinePage() {
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <div className="rounded-2xl border border-border bg-background px-5 py-10 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          BeautyBook
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Немає підключення до Інтернету
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Перевірте мережу та спробуйте ще раз. Запис і розклад потребують
          зʼєднання з сервером.
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className="mt-8 w-full rounded-lg bg-primary px-4 py-3.5 text-base font-medium text-primary-foreground"
        >
          Спробувати ще раз
        </button>
      </div>
    </main>
  );
}
