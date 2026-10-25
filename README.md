# beartanh.dev

다희(BeartanH)의 프로젝트 아카이브. React + Vite로 빌드해서 Cloudflare Workers 정적 자산으로 배포해요.

## 실행

```bash
npm install
npm run dev      # 로컬 개발 서버
npm run deploy   # 빌드 후 beartanh.dev에 배포 (처음엔 npx wrangler login 먼저)
```

## 프로젝트 추가

`src/data/projects.ts`의 `projects` 배열 끝에 항목을 하나 추가하면 아카이브에 번호 순서대로 나와요.
`url`이 있으면 카드 전체가 그 주소로 연결되고, `status`는 `live`(운영 중) / `wip`(작업 중) / `archived`(보관) 중 하나예요.
프로젝트를 바꾸면 공유 미리보기 이미지도 다시 만들어 커밋해요: `node scripts/make-og.cjs` → `public/og.png` (Playwright 필요).

## 빌드 (미리 그리기)

`npm run build`는 화면을 빌드한 뒤 `scripts/prerender.mjs`로 첫 화면을 HTML에 미리 그려 넣어요.
JS 없이도(검색로봇, 광고 심사) 내용이 보이고, 브라우저는 그 위에 이어 붙여요(`hydrateRoot`, `src/main.tsx`).
그래서 첫 화면은 서버와 브라우저에서 똑같아야 해요 — 렌더 중에 `window`·현재 시각·랜덤 값으로 갈라지지 말고 `useEffect`에서 처리해요.

## 고정 페이지

- `public/privacy/index.html` 개인정보처리방침 (정적 HTML). 광고·분석 도구를 붙이거나 바꾸면 글과 시행일을 같이 고쳐요.
- `public/robots.txt`, `public/sitemap.xml` 페이지를 늘리면 사이트맵에도 추가해요.

## 사용한 React Bits 컴포넌트

`src/components/reactbits/`에 원본을 복사해 두었어요 (MIT + Commons Clause, `LICENSE.md` 참고).

- Topography — 히어로 배경의 등고선 지형 (WebGL2)
- DecryptedText — 이름과 아카이브 번호가 해독되듯 나타나는 효과
- SpotlightCard — 아카이브 카드의 마우스 스포트라이트
