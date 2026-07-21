"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export type PwaInstallState = {
  /** Browser fired beforeinstallprompt — install UI can be shown later. */
  canInstall: boolean;
  /** App already runs in standalone / installed mode. */
  isInstalled: boolean;
  /** Platform supports install prompts (Chromium-based). */
  isSupported: boolean;
  /** Triggers native install dialog when available. */
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
};

const PwaInstallContext = createContext<PwaInstallState | null>(null);

function getIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const media = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in window.navigator &&
    Boolean(
      (window.navigator as Navigator & { standalone?: boolean }).standalone,
    );
  return media || iosStandalone;
}

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsInstalled(getIsStandalone());
    setIsSupported(
      typeof window !== "undefined" && "serviceWorker" in navigator,
    );

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return "unavailable" as const;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return choice.outcome;
  }, [deferredPrompt]);

  const value = useMemo<PwaInstallState>(
    () => ({
      canInstall: Boolean(deferredPrompt) && !isInstalled,
      isInstalled,
      isSupported,
      promptInstall,
    }),
    [deferredPrompt, isInstalled, isSupported, promptInstall],
  );

  return (
    <PwaInstallContext.Provider value={value}>
      {children}
    </PwaInstallContext.Provider>
  );
}

/** Public install API — no UI. Use later for banners / settings. */
export function usePwaInstall(): PwaInstallState {
  const context = useContext(PwaInstallContext);
  if (!context) {
    throw new Error("usePwaInstall must be used within PwaInstallProvider");
  }
  return context;
}
