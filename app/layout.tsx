import type { Metadata, Viewport } from "next";
import { Fraunces, Gowun_Batang } from "next/font/google";
import GlobalAlarm from "@/components/GlobalAlarm";
import SWRegister from "@/components/SWRegister";
import "./globals.css";

const gowun = Gowun_Batang({
  weight: ["400", "700"],
  subsets: ["latin"],
  preload: false,
  variable: "--font-gowun",
});

const fraunces = Fraunces({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-fraunces",
});

// 배포 URL. 공유 미리보기(OG)의 절대경로 기준 — 배포 후 실제 도메인으로 갱신한다.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pasta-timer.vercel.app";
const TITLE = "파스타 타이머(뽀모올리)";
const DESCRIPTION =
  "면 종류를 고르면 딱 맞는 타이머가 돌아가고, 삶는 동안 레시피를 볼 수 있어요. 뽀모와 올리가 도와드릴게요.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  manifest: "/manifest.webmanifest",
  applicationName: "뽀모올리",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "뽀모올리" },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: "/icons/apple-touch-icon.png",
  },
  // 카카오톡·슬랙 공유 시 미리보기 카드 (한국에서 공유는 대부분 카톡 → og:image·og:title을 읽는다)
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: TITLE,
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "뽀모가 냄비에 스파게티를 젓고 있는 그림" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF3E0",
  width: "device-width",
  initialScale: 1,
  // 앱인토스 체크리스트: 지도처럼 필수가 아니면 제스처 확대를 비활성화한다.
  // iOS Safari는 userScalable을 무시하므로 globals.css의 touch-action이 실질 수단이다.
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${gowun.variable} ${fraunces.variable}`}>
      <head>
        {/* 본문 폰트 SUIT. Pretendard는 DESIGN.md 금지 목록이라 로드하지 않는다 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          href="https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.css"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <SWRegister />
        <GlobalAlarm />
      </body>
    </html>
  );
}
