// 뽀모올리 서비스워커 — 오프라인에서도 타이머·레시피가 열리게 하는 캐시 전략.
// 전략 (2026-07-16 검수 반영):
//  - 페이지 내비게이션 + RSC 페이로드: network-first (배포 후 옛 콘텐츠 고착 방지)
//  - 해시된 정적 자원(/_next/static)·이미지·아이콘: cache-first (내용이 URL에 고정됨)
//  - 크로스오리진 폰트 CSS/woff2: cache-first, opaque 응답도 저장 (no-cors라 res.ok가 항상 false)
const CACHE = "pomooli-v2";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/"])));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function networkFirst(req) {
  return fetch(req)
    .then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    })
    .catch(() => caches.match(req).then((hit) => hit || caches.match("/")));
}

function cacheFirst(req, allowOpaque) {
  return caches.match(req).then(
    (hit) =>
      hit ||
      fetch(req).then((res) => {
        if (res.ok || (allowOpaque && res.type === "opaque")) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
  );
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // 페이지 이동과 App Router 클라이언트 내비게이션(RSC payload)은 신선함 우선
  if (req.mode === "navigate" || url.searchParams.has("_rsc")) {
    e.respondWith(networkFirst(req));
    return;
  }

  // 크로스오리진 폰트(jsdelivr 등)는 opaque 응답 허용 cache-first
  if (url.origin !== self.location.origin) {
    if (url.hostname.includes("jsdelivr") || url.hostname.includes("gstatic") || url.hostname.includes("googleapis")) {
      e.respondWith(cacheFirst(req, true));
    }
    return;
  }

  // 같은 오리진 정적 자원 — 해시 포함이라 cache-first가 안전
  e.respondWith(cacheFirst(req, false));
});
