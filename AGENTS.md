# 뽀모도로 파스타 타이머 — Claude 작업 규칙

파스타 종류별 삶기 타이머 + 레시피 PWA. 사용자(최재원)는 바이브 코더 — 코드·CLI는
Claude가 전부 수행한다.

이 앱은 워크스페이스 `/Users/choejaewon/project/어플 만들기/`의 일부다. 이 repo가
단독으로 열려도 아래 규칙은 지킨다:

- **상태 정본은 `docs/PROJECT.md`** — 작업 시작 전에 읽고, 의미 있는 진행·결정 후 갱신한다.
- **기획 정본은 `docs/PRD.md`** — 기능 추가·변경은 PRD와 대조 후 진행한다.
- **디자인 확정 전 구현 시작 금지** (현재 상태). UI 작업 전
  `/Users/choejaewon/project/design-references/INDEX.md`를 먼저 읽고 관련 스크린샷을
  Read로 본다. `frontend-design` 스킬 사용, 완성 후 `design-review`로 QA.
- **검수 자동 실행**: 배포 전 `code-review`·보안검사를 사용자에게 묻지 말고 돌린다.
- **운영 중 버그픽스**: investigate → 수정 → verify → code-review(diff 범위만) → ship
  재배포 → PROJECT.md 결정 로그 기록.
- 커밋은 작업 소유 경로만 명시해 스테이징 (`git add -A` 금지).
