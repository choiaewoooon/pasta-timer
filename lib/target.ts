/**
 * 빌드 타깃 구분.
 * - "web"  (기본): Vercel PWA — 자체 헤더·하단 토글을 그대로 쓴다
 * - "toss": 앱인토스 미니앱 — 토스가 자체 내비게이션 바를 얹으므로 우리 헤더를 숨긴다
 *   (출시 체크리스트: "토스 뒤로가기 버튼과 자체 뒤로가기 버튼이 동시에 보이지 않아요")
 *
 * 빌드 시 NEXT_PUBLIC_TARGET=toss 로 지정한다. 값은 빌드 타임에 인라인되므로
 * 정적 export에서도 안전하다.
 */
export const TARGET = process.env.NEXT_PUBLIC_TARGET === "toss" ? "toss" : "web";
export const IS_TOSS = TARGET === "toss";
