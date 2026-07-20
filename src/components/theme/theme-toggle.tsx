"use client";

import { useTheme } from "@/components/theme/theme-provider";
import type { Theme } from "@/lib/theme";

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="inline-flex rounded-lg border border-border bg-muted p-0.5"
      role="group"
      aria-label="Тема оформлення"
    >
      {OPTIONS.map((option) => {
        const isActive = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-pressed={isActive}
            className={
              isActive
                ? "rounded-md bg-background px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm"
                : "rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground"
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
