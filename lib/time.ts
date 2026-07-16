// 타이머 시간 계산 — 전부 timestamp 기반. setInterval 지연/백그라운드 전환에도 어긋나지 않는다.

/** 남은 ms → "MM:SS". 음수는 00:00로 클램프. */
export function formatMMSS(remainingMs: number): string {
  const clamped = Math.max(0, remainingMs);
  const totalSec = Math.ceil(clamped / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** 종료 시각 기준 남은 ms. */
export function remainingMs(endAt: number, now: number): number {
  return Math.max(0, endAt - now);
}

/** 진행률 0~1. duration이 0 이하이면 1(완료)로 처리. */
export function progress(durationMs: number, remaining: number): number {
  if (durationMs <= 0) return 1;
  return Math.min(1, Math.max(0, 1 - remaining / durationMs));
}
