/// <reference lib="esnext" />
/// <reference lib="webworker" />

import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkOnly,
  Serwist,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * Offline strategy: cache shell assets only.
 * Never cache API / Supabase / Server Actions payloads.
 */
const runtimeCaching: RuntimeCaching[] = [
  {
    matcher: ({ url }) =>
      url.hostname.includes("supabase.co") ||
      url.pathname.includes("/auth/") ||
      url.pathname.startsWith("/api/"),
    handler: new NetworkOnly(),
  },
  {
    matcher: ({ request, sameOrigin, url }) =>
      sameOrigin &&
      (request.destination === "style" ||
        request.destination === "script" ||
        request.destination === "worker" ||
        url.pathname.startsWith("/_next/static/")),
    handler: new CacheFirst({
      cacheName: "beautybook-static",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 128,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        }),
      ],
    }),
  },
  {
    matcher: ({ request, sameOrigin, url }) =>
      sameOrigin &&
      (request.destination === "font" ||
        url.pathname.startsWith("/icons/") ||
        request.destination === "image"),
    handler: new CacheFirst({
      cacheName: "beautybook-assets",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 64,
          maxAgeSeconds: 60 * 60 * 24 * 60,
        }),
      ],
    }),
  },
  {
    matcher: ({ request }) => request.mode === "navigate",
    handler: new NetworkOnly(),
  },
  {
    matcher: () => true,
    handler: new NetworkOnly(),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.mode === "navigate";
        },
      },
    ],
  },
});

serwist.addEventListeners();
