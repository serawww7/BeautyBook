import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";

const gitRevision = spawnSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf-8",
}).stdout;

const revision = (gitRevision ?? "").trim() || crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    swSrc: "src/app/sw.ts",
    additionalPrecacheEntries: [
      { url: "/~offline", revision },
      { url: "/icons/icon-192x192.png", revision },
      { url: "/icons/icon-512x512.png", revision },
      { url: "/icons/apple-touch-icon.png", revision },
    ],
    useNativeEsbuild: true,
  });
