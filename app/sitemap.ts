import type { MetadataRoute } from "next";
import { PASTAS } from "@/lib/pastas";

export const dynamic = "force-static";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pasta-timer.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, priority: 1 },
    ...PASTAS.map((p) => ({ url: `${BASE}/pasta/${p.slug}/`, priority: 0.8 })),
  ];
}
