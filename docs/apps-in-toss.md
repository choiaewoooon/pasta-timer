# 앱인토스(Apps in Toss) 출시 진행 상황

> 2026-07-17 착수. 목적은 수익이 아니라 **포트폴리오 이력** ("토스 앱에 출시된 미니앱").
> 수익화를 안 하므로 정산·사업자등록 요건은 무관하다.

## 완료 (Claude)
- [x] **정적 빌드 전환** — `output: "export"`. 앱인토스 출시 체크리스트의 **SSR 금지** 요건 충족.
      manifest 라우트에 `dynamic = "force-static"`, `next/image`는 `unoptimized`.
- [x] 정적 서버 E2E 검증 — 홈·상세·manifest·이미지 200, 타이머 카운트다운 정상, 콘솔 에러 0
- [x] SDK `@apps-in-toss/web-framework` 설치 후 빌드·테스트 통과 확인 (1159 패키지 유입되나 영향 없음)
- [x] 갤럭시 360px 뷰포트 레이아웃 검증, 안드로이드 적응형 아이콘

## 막힌 지점 — 사용자 계정 필요
`ait` CLI 흐름: `ait init --app-name <name>` → `ait token add --api-key <key>` → `ait build` → `ait deploy`

**appName**과 **API 키** 둘 다 [개발자센터](https://developers-apps-in-toss.toss.im/) 콘솔 등록에서 나온다.
로그인·계정 생성은 Claude가 대신 할 수 없다 (전역 규약: GUI 계정 조작은 사용자 몫).

### 콘솔 등록 시 입력할 정보
- **앱 이름(displayName)**: `파스타 타이머(뽀모올리)`
- **설명**: 면 종류를 고르면 딱 맞는 타이머가 돌아가고, 삶는 동안 레시피를 볼 수 있어요.
- **대표 색상(primaryColor)**: `#D95B43`
- **아이콘**: `public/icons/icon-512.png`

사용자가 콘솔에서 앱을 등록하고 아래 두 값을 알려주면 Claude가 이어받는다:
1. **appName** (앱 식별 키)
2. **API 키** (배포 토큰)

## 남은 작업 (값 받으면 Claude가 수행)
- [ ] `ait init` + `granite.config.ts` 작성 — appName·displayName·primaryColor(#D95B43)·icon
- [ ] 샌드박스 앱으로 갤럭시 실기기 테스트
- [ ] 체크리스트 대응: **내비게이션 바 구현** (토스 미니앱은 자체 nav 규격이 있음 — 현재 앱의
      뒤로가기 버튼과 충돌 가능성 점검 필요), 바텀시트 자동 열림 금지 등
- [ ] `ait build` → `ait deploy` → 심사 제출

## 알려진 미확인 사항
- 심사 기간·거절 사유·서류 요건은 공식 체크리스트 문서에 없음 → 등록 후 콘솔에서 확인
- 토스 미니앱 내비게이션 바 규격과 현재 앱 UI의 정합성은 샌드박스 테스트 전까지 미검증
