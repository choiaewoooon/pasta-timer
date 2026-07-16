import Image from "next/image";
import Link from "next/link";
import { PASTAS } from "@/lib/pastas";

export default function Home() {
  return (
    <main className="frame">
      <header style={{ padding: "24px 4px 8px", textAlign: "center" }}>
        <p style={{ fontWeight: 800, letterSpacing: "0.4em", fontSize: 13, marginBottom: 14 }}>
          <span style={{ color: "var(--red)" }}>뽀모</span>
          <span style={{ color: "var(--sage)" }}>올리</span>
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 14 }}>
          <Image src="/characters/pomo.png" alt="토마토 캐릭터 뽀모" width={72} height={72} className="mascot-bob" priority style={{ borderRadius: "50%" }} />
          <Image src="/characters/oli.png" alt="올리브 캐릭터 올리" width={64} height={64} className="mascot-bob delay" style={{ marginTop: 8, borderRadius: "50%" }} priority />
        </div>
        <h1 className="serif" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.4 }}>
          오늘은 어떤 파스타를<br />삶을까요?
        </h1>
      </header>

      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
        {PASTAS.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/pasta/${p.slug}`}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 18px",
                textDecoration: "none",
                color: "inherit",
                minHeight: 72,
              }}
            >
              <div style={{ flex: 1 }}>
                <p className="serif" style={{ fontSize: 17, fontWeight: 700 }}>{p.nameKo}</p>
                <p style={{ fontSize: 12.5, color: "var(--brown-soft)", marginTop: 2 }}>{p.shape}</p>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "var(--pink-soft)",
                  color: "var(--red-deep)",
                  whiteSpace: "nowrap",
                }}
              >
                {p.alDenteMin}분
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <footer style={{ textAlign: "center", padding: "20px 0 4px" }}>
        <p style={{ fontSize: 12, color: "var(--brown-soft)" }}>
          삶는 시간은 일반 건면 기준이에요. 봉지에 적힌 시간이 다르면 직접 입력을 사용하세요.
        </p>
      </footer>
    </main>
  );
}
