"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatMMSS, progress, remainingMs } from "@/lib/time";
import { IS_TOSS } from "@/lib/target";
import { WATER_GUIDE } from "@/lib/pastas";
import type { Pasta } from "@/lib/pastas";

type Mode = "aldente" | "normal" | "custom";
type Phase = "idle" | "running" | "paused" | "done";

type Saved = {
  slug: string;
  nameKo?: string;
  mode: Mode;
  customMin: number;
  phase: Phase;
  endAt: number;
  pausedRemaining: number;
  durationMs: number;
};

const STORAGE_KEY = "pomooli-timer";

// 주방은 시끄럽다 — 물 끓는 소리, 후드, 환풍기. 신호음 설계의 제약이 여기서 나온다.
// 1) 파형: sine은 배음이 없어 소음에 가장 잘 묻힌다. triangle은 배음이 있어 뚫고 나온다.
// 2) 음역: 사람 귀는 2~4kHz에서 가장 예민하다. 같은 진폭이어도 저음은 훨씬 작게 들린다.
// 3) 볼륨: 위 둘을 먼저 잡고 나서 올린다. gain만 키우면 클리핑으로 찢어지는 소리가 난다.
const PRE_GAIN = 0.55;  // 완료음보다는 낮게 유지 — '진짜 끝'과 구분돼야 한다
const DONE_GAIN = 0.85;

// 완료 전 예비 신호 3단계 (내림차순 필수 — tick에서 위에서부터 훑는다).
// 음이 높아지고 횟수가 늘수록 급하다는 뜻. 소리만 듣고도 남은 시간이 구분된다.
const PRE_ALERTS = [
  { at: 60_000, freq: 1320, count: 1, gap: 0,    vibe: [220] },          // 면수 떠두세요
  { at: 30_000, freq: 1760, count: 2, gap: 0.26, vibe: [180, 90, 180] }, // 건질 준비
  { at: 10_000, freq: 2200, count: 3, gap: 0.20, vibe: [150, 70, 150, 70, 150] }, // 곧 건지세요
] as const;

// 초보가 '알덴테'를 몰라 심이 남은 면을 덜 익었다고 오해하는 걸 막는다
const MODE_HINT: Record<string, string> = {
  aldente: "가운데 심이 살짝 남는 정도. 팬에서 소스와 볶으면 딱 맞아요.",
  normal: "소스 없이 그대로 먹거나, 아이와 함께라면 이쪽이 좋아요.",
  custom: "봉지 뒷면에 적힌 시간을 그대로 넣어주세요.",
};

// 링 지오메트리 — DESIGN.md: 삶는 중 = C안의 진행 링, 뽀모가 링 위를 이동
const SIZE = 230;
const R = 97;
const C = 2 * Math.PI * R;

export default function Timer({ pasta }: { pasta: Pasta }) {
  const [mode, setMode] = useState<Mode>("aldente");
  const [customMin, setCustomMin] = useState(pasta.normalMin);
  const [phase, setPhase] = useState<Phase>("idle");
  const [remaining, setRemaining] = useState(
    (pasta.variants ? pasta.variants[Math.floor(pasta.variants.length / 2)].alDenteMin : pasta.alDenteMin) * 60_000,
  );
  const [otherTimer, setOtherTimer] = useState<{ slug: string; nameKo: string } | null>(null);
  // 굵기 변형이 있는 면(스파게티)은 어떤 굵기를 골랐는지 기억한다. 기본은 가운데(가장 흔한 굵기)
  const [variantIdx, setVariantIdx] = useState(
    pasta.variants ? Math.floor(pasta.variants.length / 2) : 0,
  );
  // 이미 울린 예비 신호의 임계값들. 되감기·재시작 시 초기화한다.
  const firedAlertsRef = useRef<Set<number>>(new Set());

  const endAtRef = useRef(0);
  const durationRef = useRef(pasta.alDenteMin * 60_000);
  const audioRef = useRef<AudioContext | null>(null);
  const wakeLockRef = useRef<{ release(): Promise<void> } | null>(null);

  // 굵기 변형이 있으면 그 값이 기준. 없으면 파스타 기본값.
  const times = pasta.variants?.[variantIdx] ?? pasta;
  const durationFor = useCallback(
    (m: Mode, cMin: number) =>
      (m === "aldente" ? times.alDenteMin : m === "normal" ? times.normalMin : cMin) * 60_000,
    [times.alDenteMin, times.normalMin],
  );

  const persist = useCallback((s: Partial<Saved>) => {
    try {
      const cur = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...cur, ...s }));
    } catch { /* 저장 실패는 치명적이지 않음 — 타이머는 계속 동작 */ }
  }, []);

  // 새로고침·재방문 복구
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const s: Saved = JSON.parse(raw);
      if (!s.phase) return;
      // 다른 파스타의 타이머가 진행 중이면 배너로 알린다 (조용한 덮어쓰기 방지)
      if (s.slug !== pasta.slug) {
        if (s.phase === "running" || s.phase === "paused") {
          setOtherTimer({ slug: s.slug, nameKo: s.nameKo ?? "다른 파스타" });
        }
        return;
      }
      // 완료된 기록은 복원하지 않는다 — 표시 불일치 방지, 완전한 초기 상태로
      if (s.phase === "done") {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      setMode(s.mode);
      setCustomMin(s.customMin || pasta.normalMin);
      durationRef.current = s.durationMs;
      if (s.phase === "running") {
        const rem = remainingMs(s.endAt, Date.now());
        endAtRef.current = s.endAt;
        if (rem <= 0) {
          setPhase("done");
          setRemaining(0);
        } else {
          setPhase("running");
          setRemaining(rem);
        }
      } else if (s.phase === "paused") {
        setPhase("paused");
        setRemaining(s.pausedRemaining);
      }
    } catch { /* 손상된 저장값은 무시하고 초기 상태로 */ }
  }, [pasta.slug, pasta.normalMin]);

  // 예비 신호음 — 완료음보다 짧고 낮게 (놀라지 않게).
  // 남은 시간이 줄수록 음이 높아지고 횟수가 늘어 '급해지는' 느낌을 준다.
  // 주방에서는 물 끓는 소리에 묻히기 쉬워서, 말보다 짧은 신호음이 잘 들린다.
  const preBeep = useCallback((freq: number, count: number, gap: number, vibe: readonly number[]) => {
    const ctx = audioRef.current;
    if (!ctx) return;
    const t0 = ctx.currentTime;
    for (let i = 0; i < count; i++) {
      const at = t0 + i * gap;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle"; // 배음이 있어 주방 소음을 뚫는다 (sine은 묻힌다)
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, at);
      gain.gain.exponentialRampToValueAtTime(PRE_GAIN, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(at);
      osc.stop(at + 0.35);
    }
    // readonly 상수를 그대로 넘길 수 없어 복사본을 만든다
    if (navigator.vibrate) navigator.vibrate([...vibe]);
  }, []);

  const ding = useCallback(async () => {
    const ctx = audioRef.current;
    // iOS Safari는 백그라운드 전환 시 AudioContext를 suspend — 반드시 resume 후 재생
    if (ctx && ctx.state === "suspended") {
      await ctx.resume().catch(() => {});
    }
    if (ctx) {
      const beep = (at: number, freq: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle"; // 예비음과 동일 — 주방 소음을 뚫기 위해
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.001, at);
        gain.gain.exponentialRampToValueAtTime(DONE_GAIN, at + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, at + 0.35);
        osc.connect(gain).connect(ctx.destination);
        osc.start(at);
        osc.stop(at + 0.4);
      };
      const t = ctx.currentTime;
      // 예비음 최고치(2200Hz)보다 위로 올려 '끝'이 확실히 구분되게 한다
      [0, 0.45, 0.9, 1.8, 2.25, 2.7].forEach((d, i) => beep(t + d, i % 3 === 2 ? 3136 : 2637));
    }
    if (navigator.vibrate) navigator.vibrate([300, 120, 300, 120, 500]);
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("면이 다 삶아졌어요! 🍝", {
        body: `${pasta.nameKo} 완성 — 얼른 건져주세요.`,
        icon: "/icons/icon-192.png",
      });
    }
  }, [pasta.nameKo]);

  // 진행 tick — timestamp 기반이라 백그라운드에 다녀와도 정확
  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      const rem = remainingMs(endAtRef.current, Date.now());
      setRemaining(rem);
      // 예비 신호 3단계. 1분 전은 면수를 미리 떠두라는 신호(레시피 대부분이 면수를 쓰는데,
      // 완료 알람이 울린 뒤엔 이미 손이 바쁘다), 30초·10초는 건질 준비 신호다.
      // 임계값을 내림차순으로 훑어 '가장 급한 것 하나만' 울린다 — 백그라운드에 다녀와
      // 여러 임계값을 한 번에 지나쳤을 때 신호음이 겹쳐 울리는 걸 막는다.
      for (const a of PRE_ALERTS) {
        if (rem > 0 && rem <= a.at && !firedAlertsRef.current.has(a.at)) {
          // 지나쳐버린 상위 임계값은 울리지 않고 '울림 처리'만 해둔다
          PRE_ALERTS.forEach((x) => { if (x.at >= a.at) firedAlertsRef.current.add(x.at); });
          preBeep(a.freq, a.count, a.gap, a.vibe);
          break;
        }
      }
      if (rem <= 0) {
        setPhase("done");
        persist({ phase: "done" });
        ding();
      }
    }, 200);
    return () => clearInterval(id);
  }, [phase, ding, persist]);

  // 화면 꺼짐 방지 — 삶는 중에만
  useEffect(() => {
    const request = async () => {
      try {
        if (phase === "running" && "wakeLock" in navigator) {
          wakeLockRef.current = await (navigator as Navigator & {
            wakeLock: { request(type: "screen"): Promise<{ release(): Promise<void> }> };
          }).wakeLock.request("screen");
        }
      } catch { /* 미지원 브라우저 — 타이머 자체는 timestamp 기반이라 무관 */ }
    };
    if (phase === "running") {
      request();
      const onVis = () => {
        if (document.visibilityState === "visible") {
          request();
          setRemaining(remainingMs(endAtRef.current, Date.now()));
        }
      };
      document.addEventListener("visibilitychange", onVis);
      return () => {
        document.removeEventListener("visibilitychange", onVis);
        wakeLockRef.current?.release().catch(() => {});
        wakeLockRef.current = null;
      };
    }
  }, [phase]);

  // 탭 제목에 남은 시간
  useEffect(() => {
    if (phase === "running") document.title = `${formatMMSS(remaining)} · ${pasta.nameKo} — 뽀모올리`;
    else if (phase === "done") document.title = `완성! ${pasta.nameKo} — 뽀모올리`;
    else document.title = "파스타 타이머(뽀모올리)";
  }, [phase, remaining, pasta.nameKo]);

  const start = () => {
    if (!audioRef.current) {
      const AC = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) audioRef.current = new AC();
    }
    audioRef.current?.resume().catch(() => {});
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    const dur = phase === "paused" ? remaining : durationFor(mode, customMin);
    if (phase !== "paused") durationRef.current = durationFor(mode, customMin);
    endAtRef.current = Date.now() + dur;
    setRemaining(dur);
    setPhase("running");
    setOtherTimer(null);
    // 일시정지에서 '계속'은 이어하기라 이미 울린 신호를 다시 울리지 않는다.
    // 처음부터 시작하는 경우에만 초기화한다.
    if (phase !== "paused") firedAlertsRef.current.clear();
    persist({
      slug: pasta.slug, nameKo: pasta.nameKo, mode, customMin, phase: "running",
      endAt: endAtRef.current, durationMs: durationRef.current, pausedRemaining: 0,
    });
  };

  const pause = () => {
    const rem = remainingMs(endAtRef.current, Date.now());
    setRemaining(rem);
    setPhase("paused");
    persist({ phase: "paused", pausedRemaining: rem });
  };

  const reset = () => {
    setPhase("idle");
    firedAlertsRef.current.clear();
    setRemaining(durationFor(mode, customMin));
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  };

  const pickVariant = (i: number) => {
    setVariantIdx(i);
    const v = pasta.variants![i];
    setRemaining((mode === "aldente" ? v.alDenteMin : mode === "normal" ? v.normalMin : customMin) * 60_000);
  };

  const pickMode = (m: Mode) => {
    setMode(m);
    setRemaining(durationFor(m, customMin));
  };

  const bumpCustom = (d: number) => {
    const next = Math.min(30, Math.max(1, customMin + d));
    setCustomMin(next);
    if (mode === "custom") setRemaining(next * 60_000);
  };

  const p = progress(durationRef.current, remaining);
  const angle = p * 360 - 90;
  const px = SIZE / 2 + R * Math.cos((angle * Math.PI) / 180);
  const py = SIZE / 2 + R * Math.sin((angle * Math.PI) / 180);
  const showRing = phase === "running" || phase === "paused";
  const almostDone = remaining <= 60_000;
  // DESIGN.md: 성격 표현은 캐릭터에게 맡긴다 — 감정이 바뀌는 순간마다 포즈를 바꾼다.
  // 링 위 마커는 한 화면에 한 번만 등장하므로 '캐릭터 1회' 규칙을 지킨다.
  const ringPose =
    phase === "paused"
      ? "/characters/pomo-sleepy.png"
      : almostDone
        ? "/characters/pomo-excited.png"
        : "/characters/pomo.png";

  return (
    <section
      id="timer-section"
      className="card"
      aria-label="타이머"
      style={{
        position: "sticky", top: 12, zIndex: 10,
        padding: "20px 18px 18px", textAlign: "center",
        background: phase === "done" ? "rgba(111,122,99,0.12)" : undefined,
        // DESIGN.md: 완료 화면에만 토마토 패턴 은은하게
        backgroundImage:
          phase === "done"
            ? "radial-gradient(circle at 15% 20%, rgba(217,91,67,0.10) 0 18px, transparent 19px), radial-gradient(circle at 85% 30%, rgba(217,91,67,0.08) 0 14px, transparent 15px), radial-gradient(circle at 25% 80%, rgba(217,91,67,0.08) 0 16px, transparent 17px), radial-gradient(circle at 75% 85%, rgba(217,91,67,0.10) 0 12px, transparent 13px)"
            : undefined,
      }}
    >
      {phase === "idle" && (
        <>
          {otherTimer && (
            <Link
              href={`/pasta/${otherTimer.slug}`}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                marginBottom: 10, padding: "11px 14px", borderRadius: 14,
                background: "var(--pink-soft)", color: "var(--red-deep)",
                fontSize: 13.5, fontWeight: 700, textDecoration: "none", textAlign: "left",
              }}
            >
              <Image src="/ui-icons/tomato-plain.png" alt="" width={24} height={24} style={{ flexShrink: 0 }} />
              <span>{otherTimer.nameKo} 타이머가 아직 돌고 있어요 — 보러 가기</span>
            </Link>
          )}
          <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: otherTimer ? 0 : -46, marginBottom: 2 }}>
            <Image src="/characters/pomo.png" alt="" width={54} height={54} className="mascot-bob" style={{ borderRadius: "50%" }} />
            <Image src="/characters/oli.png" alt="" width={48} height={48} className="mascot-bob delay" style={{ marginTop: 7, borderRadius: "50%" }} />
          </div>
          {IS_TOSS && (
            <h1 className="serif" style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>
              {pasta.nameKo}
            </h1>
          )}
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--brown-soft)", letterSpacing: "0.1em" }}>
            {mode === "aldente" ? "알덴테까지" : mode === "normal" ? "푹 익을 때까지" : "직접 입력한 시간"}
          </p>
          <p className="digits" style={{ fontSize: 64, fontWeight: 500, lineHeight: 1.15 }}>
            {formatMMSS(remaining)}
          </p>
          {pasta.variants && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 12, color: "var(--brown-soft)", marginBottom: 6 }}>
                봉지 앞면의 굵기를 골라주세요
              </p>
              <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                {pasta.variants.map((v, i) => (
                  <button
                    key={v.label}
                    className={`pill pill-quiet${variantIdx === i ? " on" : ""}`}
                    aria-pressed={variantIdx === i}
                    onClick={() => pickVariant(i)}
                    style={{ fontSize: 13, padding: "0 14px" }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "10px 0 6px", flexWrap: "wrap" }}>
            <button className={`pill pill-quiet${mode === "aldente" ? " on" : ""}`} aria-pressed={mode === "aldente"} onClick={() => pickMode("aldente")}>
              알덴테 {times.alDenteMin}분
            </button>
            <button className={`pill pill-quiet${mode === "normal" ? " on" : ""}`} aria-pressed={mode === "normal"} onClick={() => pickMode("normal")}>
              기본 {times.normalMin}분
            </button>
            <button className={`pill pill-quiet${mode === "custom" ? " on" : ""}`} aria-pressed={mode === "custom"} onClick={() => pickMode("custom")}>
              직접 입력
            </button>
          </div>
          <p style={{ fontSize: 12.5, color: "var(--brown-soft)", margin: "0 auto 14px", maxWidth: 300, lineHeight: 1.5 }}>
            {MODE_HINT[mode]}
          </p>
          {mode === "custom" && (
            <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center", marginBottom: 14 }}>
              <button className="pill pill-quiet" aria-label="1분 줄이기" onClick={() => bumpCustom(-1)} style={{ width: 48 }}>−</button>
              <span style={{ fontSize: 17, fontWeight: 700, minWidth: 52 }}>{customMin}분</span>
              <button className="pill pill-quiet" aria-label="1분 늘리기" onClick={() => bumpCustom(1)} style={{ width: 48 }}>＋</button>
            </div>
          )}
          <div
            style={{
              display: "flex", gap: 10, alignItems: "flex-start", textAlign: "left",
              padding: "12px 14px", marginBottom: 14, borderRadius: 14,
              background: "rgba(94, 104, 83, 0.10)",
            }}
          >
            {/* 시스템 이모지 대신 크레파스 오브젝트 — DESIGN.md 화풍 통일 (의인화 없음) */}
            <Image src="/ui-icons/water-salt.png" alt="" width={28} height={28} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13.5, color: "var(--brown)", lineHeight: 1.55 }}>
              <b>먼저 물부터.</b> 1인분({WATER_GUIDE.perServing.pastaG}g)에 물{" "}
              {WATER_GUIDE.perServing.waterL}L, 소금 {WATER_GUIDE.perServing.saltTsp}작은술.{" "}
              <span style={{ color: "var(--brown-soft)" }}>{WATER_GUIDE.note}</span>
            </p>
          </div>
          <button className="pill pill-primary" onClick={start}>삶기 시작</button>
          <p style={{ fontSize: 12.5, color: "var(--brown-soft)", marginTop: 10 }}>
            물이 팔팔 끓고 면을 넣는 순간 눌러주세요
          </p>
        </>
      )}

      {showRing && (
        <>
          <div style={{ position: "relative", width: SIZE, height: SIZE, margin: "4px auto 6px" }}>
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
              <circle cx={SIZE / 2} cy={SIZE / 2} r={R - 14} fill="var(--cream-card)" />
              <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="var(--pink)" strokeWidth={11} />
              <circle
                cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none"
                stroke="var(--red)" strokeWidth={11} strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C * (1 - p)}
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                style={{ transition: "stroke-dashoffset 0.25s linear" }}
              />
            </svg>
            <div className="digits" aria-hidden="true" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, fontWeight: 500 }}>
              {formatMMSS(remaining)}
            </div>
            {/* 스크린리더: 초 단위로 낭독하면 시끄러우므로 분 단위로만 알린다 */}
            <p className="sr-only" role="status" aria-live="polite">
              {Math.ceil(remaining / 60_000)}분 남았어요
            </p>
            <Image
              src={ringPose} alt="" width={44} height={44}
              style={{ position: "absolute", left: px - 22, top: py - 22, transition: "left 0.25s linear, top 0.25s linear", borderRadius: "50%", boxShadow: "0 2px 8px rgba(61,44,36,0.18)" }}
            />
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--brown-soft)", marginBottom: 12 }}>
            {phase === "paused"
              ? "잠시 멈췄어요"
              : almostDone
                ? "곧 완성! 면수 한 컵 미리 떠두세요"
                : "뽀모가 지켜보는 중 — 아래에서 소스를 준비해요"}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {phase === "running" ? (
              <button className="pill pill-primary" onClick={pause}>일시정지</button>
            ) : (
              <button className="pill pill-primary" onClick={start}>계속</button>
            )}
            <button className="pill pill-quiet" onClick={reset} style={{ minWidth: 84 }}>처음부터</button>
          </div>
        </>
      )}

      {phase === "done" && (
        <>
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 6 }}>
            <Image src="/characters/pomo.png" alt="" width={64} height={64} className="mascot-jump" style={{ borderRadius: "50%" }} />
            <Image src="/characters/oli.png" alt="" width={56} height={56} className="mascot-jump" style={{ marginTop: 8, animationDelay: "0.15s", borderRadius: "50%" }} />
          </div>
          <p className="serif" role="alert" aria-live="assertive" style={{ fontSize: 24, fontWeight: 700, color: "var(--sage)" }}>
            면이 다 삶아졌어요!
          </p>
          <p style={{ fontSize: 15, color: "var(--brown-soft)", margin: "6px 0 14px" }}>
            바로 건져서 팬으로 — 잔열에도 계속 익어요.
          </p>
          <button className="pill pill-primary" onClick={reset}>한 번 더 삶기</button>
        </>
      )}
    </section>
  );
}
