import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="frame" style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <Image
        src="/characters/oli.png"
        alt=""
        width={110}
        height={110}
        style={{ borderRadius: "50%", marginBottom: 16 }}
      />
      <h1 className="serif" style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
        찾는 페이지가 없어요
      </h1>
      <p style={{ fontSize: 15, color: "var(--brown-soft)", marginBottom: 24 }}>
        주소가 바뀌었거나 없는 파스타일 수 있어요.
      </p>
      <Link href="/" className="pill pill-primary" style={{ maxWidth: 260, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
        파스타 고르러 가기
      </Link>
    </main>
  );
}
