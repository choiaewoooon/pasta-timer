"use client";

import { useEffect } from "react";

export default function SWRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // 등록 실패해도 앱은 온라인으로 정상 동작 (fail-open)
      });
    }
  }, []);
  return null;
}
