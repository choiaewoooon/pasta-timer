import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "뽀모올리 — 파스타 타이머",
    short_name: "뽀모올리",
    description: "뽀모와 올리가 파스타 삶기를 도와줘요.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF3E0",
    theme_color: "#FAF3E0",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
