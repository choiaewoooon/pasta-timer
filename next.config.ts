import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 앱인토스는 SSR을 금지한다 (출시 체크리스트). 전량 정적 빌드로 내보낸다.
  output: "export",
  images: { unoptimized: true }, // 정적 export에서는 Next 이미지 최적화 서버가 없다
  trailingSlash: true,
};

export default nextConfig;
