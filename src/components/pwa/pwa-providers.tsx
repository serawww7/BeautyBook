"use client";

import { SerwistProvider } from "@serwist/turbopack/react";
import type { ReactNode } from "react";

import { PwaInstallProvider } from "@/lib/pwa/install";

type PwaProvidersProps = {
  children: ReactNode;
};

export function PwaProviders({ children }: PwaProvidersProps) {
  return (
    <SerwistProvider swUrl="/serwist/sw.js">
      <PwaInstallProvider>{children}</PwaInstallProvider>
    </SerwistProvider>
  );
}
