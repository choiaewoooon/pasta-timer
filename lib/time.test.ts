import { describe, expect, test } from "bun:test";
import { formatMMSS, progress, remainingMs } from "./time";

describe("formatMMSS", () => {
  test("8분을 08:00으로", () => expect(formatMMSS(8 * 60_000)).toBe("08:00"));
  test("올림 처리 — 900ms 남으면 00:01", () => expect(formatMMSS(900)).toBe("00:01"));
  test("0은 00:00", () => expect(formatMMSS(0)).toBe("00:00"));
  test("음수 클램프", () => expect(formatMMSS(-5000)).toBe("00:00"));
  test("한 자리 초 패딩", () => expect(formatMMSS(61_000)).toBe("01:01"));
});

describe("remainingMs", () => {
  test("기본 차이", () => expect(remainingMs(10_000, 4_000)).toBe(6_000));
  test("지난 시각은 0", () => expect(remainingMs(1_000, 5_000)).toBe(0));
});

describe("progress", () => {
  test("시작 시 0", () => expect(progress(10_000, 10_000)).toBe(0));
  test("절반", () => expect(progress(10_000, 5_000)).toBe(0.5));
  test("완료 시 1", () => expect(progress(10_000, 0)).toBe(1));
  test("duration 0 방어", () => expect(progress(0, 0)).toBe(1));
});
