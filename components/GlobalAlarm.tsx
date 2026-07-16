"use client";

import { useEffect } from "react";

// 타이머 페이지를 벗어나 있어도 완료를 놓치지 않게 하는 전역 감시자.
// 소리는 사용자 제스처 없이는 못 내므로(자동재생 정책) 진동·알림·탭 제목으로 알린다.
export default function GlobalAlarm() {
  useEffect(() => {
    const id = setInterval(() => {
      try {
        const raw = localStorage.getItem("pomooli-timer");
        if (!raw) return;
        const s = JSON.parse(raw);
        if (s.phase === "running" && s.endAt && Date.now() >= s.endAt) {
          localStorage.setItem("pomooli-timer", JSON.stringify({ ...s, phase: "done" }));
          if (navigator.vibrate) navigator.vibrate([300, 120, 300, 120, 500]);
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("면이 다 삶아졌어요! 🍝", {
              body: `${s.nameKo ?? "파스타"} 완성 — 얼른 건져주세요.`,
              icon: "/icons/icon-192.png",
            });
          }
          document.title = `완성! ${s.nameKo ?? "파스타"} — 뽀모올리`;
        }
      } catch { /* 감시 실패는 조용히 — 타이머 본체가 정상 경로 */ }
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return null;
}
