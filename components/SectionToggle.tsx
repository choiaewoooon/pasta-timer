"use client";

import { useEffect, useState } from "react";

// 하단 플로팅 토글 바 — 타이머/레시피 구간 이동. 스크롤과 무관하게 화면 하단에 고정.
// 레퍼런스: Wabi의 플로팅 pill 바텀 바 (design-references/app/wabi-meal-planner)
export default function SectionToggle() {
  const [active, setActive] = useState<"timer" | "recipe">("timer");

  useEffect(() => {
    const recipe = document.getElementById("recipe-section");
    if (!recipe) return;
    const onScroll = () => {
      const top = recipe.getBoundingClientRect().top;
      setActive(top < window.innerHeight * 0.45 ? "recipe" : "timer");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (target: "timer" | "recipe") => {
    if (target === "timer") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.getElementById("recipe-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const btn = (key: "timer" | "recipe", label: string) => (
    <button
      className="pill"
      onClick={() => go(key)}
      aria-current={active === key}
      style={{
        minHeight: 48,
        padding: "0 22px",
        fontSize: 14,
        background: active === key ? "var(--pink-soft)" : "transparent",
        color: active === key ? "var(--red-deep)" : "var(--brown-soft)",
      }}
    >
      {label}
    </button>
  );

  return (
    <nav
      aria-label="구간 이동"
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: "calc(14px + env(safe-area-inset-bottom))",
        zIndex: 20,
        display: "flex",
        gap: 4,
        padding: 5,
        borderRadius: 999,
        background: "var(--cream-card)",
        boxShadow: "0 8px 28px rgba(61, 44, 36, 0.22)",
      }}
    >
      {btn("timer", "타이머")}
      {btn("recipe", "레시피")}
    </nav>
  );
}
