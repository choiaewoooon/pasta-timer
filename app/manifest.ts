import type { MetadataRoute } from "next";

// 정적 export(앱인토스 SSR 금지 요건)에서 manifest 라우트도 정적으로 생성되게 한다
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    // name: 스토어·콘솔 노출용 정식 명칭 (검색 키워드를 앞에)
    // short_name: 홈 화면 아이콘 라벨 — 길면 잘리므로 브랜드만
    name: "파스타 타이머(뽀모올리)",
    short_name: "뽀모올리",
    description: "면 종류를 고르면 딱 맞는 타이머가 돌아가고, 삶는 동안 레시피를 볼 수 있어요.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FAF3E0",
    theme_color: "#FAF3E0",
    categories: ["food", "lifestyle", "utilities"],
    lang: "ko",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // 안드로이드 적응형 아이콘 — 런처가 원형·스퀘어클로 잘라내도 뽀모가 안 잘리게 안전영역 확보
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
