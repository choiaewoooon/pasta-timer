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

export const metadata: Metadata = {
  title: "뽀모올리 — 파스타 타이머",
  description: "뽀모와 올리가 파스타 삶기를 도와줘요. 면 종류를 고르면 딱 맞는 타이머와 레시피가 준비됩니다.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "뽀모올리" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#FAF3E0",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${gowun.variable} ${fraunces.variable}`}>
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.css"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
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
