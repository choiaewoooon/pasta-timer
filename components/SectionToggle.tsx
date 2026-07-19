"use client";

import { useEffect, useState } from "react";
import { IS_TOSS } from "@/lib/target";

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

  // 웹: 화면 하단에 떠 있는 pill 바 (Wabi 패턴).
  // left:50% + translateX(-50%)는 position:fixed 에서만 중앙정렬로 동작한다.
  const floating = {
    position: "fixed" as const,
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "calc(14px + env(safe-area-inset-bottom))",
    zIndex: 20,
    boxShadow: "0 8px 28px rgba(61, 44, 36, 0.22)",
  };

  // 앱인토스: 하단 플로팅은 토스 탭바로 오인될 수 있어 문서 흐름 안에 둔다.
  // ⚠️ position만 sticky로 바꾸고 위 좌표를 그대로 두면 transform이 자기 너비의
  // 절반만큼 왼쪽으로 밀어 화면 밖으로 튀어나간다(실측 x=-148px, 타이머를 가림).
  // 토스에선 타이머 카드가 상단 sticky로 항상 보이므로 떠 있을 이유도 없다.
  const inFlow = {
    position: "static" as const,
    margin: "2px auto 6px",
    width: "fit-content",
    boxShadow: "0 2px 10px rgba(61, 44, 36, 0.12)",
  };

  return (
    <nav
      aria-label="구간 이동"
      style={{
        ...(IS_TOSS ? inFlow : floating),
        display: "flex",
        gap: 4,
        padding: 5,
        borderRadius: 999,
        background: "var(--cream-card)",
      }}
    >
      {btn("timer", "타이머")}
      {btn("recipe", "레시피")}
    </nav>
  );
}
