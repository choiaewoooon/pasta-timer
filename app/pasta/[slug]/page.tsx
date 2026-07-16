import Link from "next/link";
import { notFound } from "next/navigation";
import Timer from "@/components/Timer";
import { PASTAS, getPasta } from "@/lib/pastas";

export function generateStaticParams() {
  return PASTAS.map((p) => ({ slug: p.slug }));
}

export default async function PastaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pasta = getPasta(slug);
  if (!pasta) notFound();

  const r = pasta.recipe;

  return (
    <main className="frame">
      <nav style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 2px" }}>
        <Link
          href="/"
          aria-label="파스타 목록으로 돌아가기"
          style={{
            width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center",
            textDecoration: "none", color: "var(--brown)", fontSize: 18,
          }}
        >
          ←
        </Link>
        <h1 className="serif" style={{ fontSize: 21, fontWeight: 700 }}>{pasta.nameKo}</h1>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--brown-soft)" }}>{pasta.nameIt}</span>
      </nav>

      <Timer pasta={pasta} />

      <section className="card" aria-label="레시피" style={{ background: "#fff", padding: "20px 18px" }}>
        <h2 className="serif" style={{ fontSize: 18, fontWeight: 700 }}>{r.title}</h2>
        <p style={{ fontSize: 12.5, fontWeight: 600, color: "var(--sage)", margin: "3px 0 6px" }}>
          이 파스타로 만들기 좋은 레시피
        </p>
        <p style={{ fontSize: 13.5, color: "var(--brown-soft)", marginBottom: 14 }}>{r.intro}</p>

        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--sage)", marginBottom: 8 }}>재료</h3>
        <ul style={{ listStyle: "none", display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
          {r.ingredients.map((ing) => (
            <li
              key={ing.name}
              style={{
                fontSize: 12.5, fontWeight: 600, padding: "7px 12px", borderRadius: 999,
                background: "rgba(111,122,99,0.12)", color: "var(--sage)",
              }}
            >
              {ing.name} <span style={{ fontWeight: 400 }}>{ing.amount}</span>
            </li>
          ))}
        </ul>

        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--sage)", marginBottom: 10 }}>
          만드는 순서 — 면 삶는 동안 따라 해요
        </h3>
        <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
          {r.steps.map((step, i) => (
            <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0, width: 26, height: 26, borderRadius: "50%",
                  background: "var(--sage)", color: "#fff", fontSize: 13, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1,
                }}
              >
                {i + 1}
              </span>
              <p style={{ fontSize: 14.5 }}>{step}</p>
            </li>
          ))}
        </ol>

        {r.tip && (
          <p
            style={{
              marginTop: 18, padding: "12px 14px", borderRadius: 14,
              background: "var(--pink-soft)", color: "var(--red-deep)", fontSize: 13, fontWeight: 600,
            }}
          >
            🍅 뽀모의 팁 — {r.tip}
          </p>
        )}
      </section>
    </main>
  );
}
