import { defineConfig } from "@apps-in-toss/web-framework/config";

/**
 * 앱인토스(토스 미니앱) 배포 설정.
 *
 * 이 앱은 두 타깃으로 나간다:
 * - web  : Vercel PWA  → `bun run build` (next build)
 * - toss : 토스 미니앱 → `bun run build:toss` (ait build) → `bun run deploy:toss`
 *
 * 토스 빌드는 아래 web.commands.build를 실행한다. NEXT_PUBLIC_TARGET=toss가 붙어야
 * 자체 헤더가 숨겨진다 (토스 뒤로가기와 중복 금지 — 출시 체크리스트).
 */
export default defineConfig({
  appName: "pomooli",

  brand: {
    // 화면에 노출되는 이름. 정식 명칭이 아니라 축약형을 쓰지 않는다 —
    // 스토어 등록명과 일치시켜 사용자가 찾은 이름 그대로 보이게 한다.
    displayName: "파스타 타이머",
    // DESIGN.md --red. 진행 링·강조에 쓰는 브랜드 레드
    primaryColor: "#D95B43",
    // 콘솔에 업로드한 로고와 동일한 링크를 넣어야 한다 (면 링 + 가운데 뽀모)
    icon: "https://static.toss.im/appsintoss/57715/14a15424-d2a5-483b-9d13-68df39cc31df.png",
  },

  // 선언 가능한 권한은 clipboard/geolocation/contacts/photos/camera/microphone 뿐이다.
  // 이 앱이 쓰는 진동·화면꺼짐방지(Wake Lock)·소리·localStorage는 전부 웹 API라
  // 별도 권한 선언이 필요 없다. 권한이 적을수록 심사가 빠르다.
  permissions: [],

  navigationBar: {
    // 토스가 얹는 내비게이션 바에 위임한다. 우리 헤더는 IS_TOSS 빌드에서 숨긴다.
    withBackButton: true,
    withTitle: true,
    theme: "light", // v1은 라이트 단일 모드 (DESIGN.md)
  },

  web: {
    host: "localhost",
    port: 3000,
    commands: {
      // ait는 이 문자열을 `bun <명령>`으로 실행한다. 인라인 환경변수 접두사
      // (NEXT_PUBLIC_TARGET=toss ...)를 쓰면 bun이 그걸 스크립트 이름으로 읽어 실패한다.
      // → package.json 스크립트로 감싸서 셸이 환경변수를 처리하게 한다.
      dev: "run dev",
      build: "run build:toss:web",
    },
  },

  // Next.js output:"export"의 산출 경로. 기본값 'dist'가 아니다.
  outdir: "out",
});
