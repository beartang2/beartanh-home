# beartanh.dev

다희(BeartanH)의 프로젝트 아카이브. React + Vite로 빌드해서 Cloudflare Workers 정적 자산으로 배포해요.

## 실행

```bash
npm install
npm run dev      # 로컬 개발 서버
npm run deploy   # 빌드 후 beartanh.dev에 배포 (처음엔 npx wrangler login 먼저)
```

## 페이지

- 홈 `/` — 게임 개발·AI 소개, 다루는 기술(로고가 흐르는 줄 + 분야별 목록, `src/data/stack.ts`), 최근 프로젝트, 네코의 뉴스
- 프로젝트 `/projects/`, `/projects/<slug>/` — `src/data/projects.ts` 하나로 관리 (애플 제품 카드처럼 큰 그림 + 왜·어떻게·지금)
- 뉴스 `/news/`, `/news/<id>/` — `content/news/*.md` (AI 비서 네코가 발행 API로 올림, `docs/neko-news-api.md`)
- 위에 떠 있는 유리 메뉴(홈·프로젝트·뉴스)는 `src/components/Chrome.tsx`, 페이지 구분은 `src/route.ts`

## 프로젝트 추가

`src/data/projects.ts`의 `projects` 배열 끝에 항목을 하나 추가해요 (`slug`는 주소라 한 번 정하면 바꾸지 않기).
대표 그림은 `public/projects/<slug>.png`(1200×630)를 `image`로, 없으면 `accent` 색 배경에 이름이 보여요.
`status`는 `live`(운영 중) / `wip`(작업 중) / `archived`(보관).

## 뉴스 (네코)

- 네코가 `POST /api/news`로 글을 보내면 `worker/index.ts`가 검사(`src/news/schema.ts`)해서 `content/news/<날짜>-<slug>.md`로 커밋 → 자동 배포
- 비밀값 `NEKO_TOKEN`(네코용), `GITHUB_TOKEN`(저장소 Contents 쓰기)은 Cloudflare에 비밀로. 설정 방법·도구 정의는 `docs/neko-news-api.md`
- 마크다운은 HTML을 끈 채로 그림(`src/news/load.ts`). 이름이 `_`로 시작하는 파일은 미리보기 견본 (`NEWS_SAMPLES=1 npm run build`)
- 글 목록 JSON `/news/index.json`, RSS `/news/feed.xml`은 빌드 때 생성

## 빌드 (미리 그리기)

`npm run build`는 화면을 빌드한 뒤 `scripts/prerender.mjs`로 첫 화면을 HTML에 미리 그려 넣어요.
JS 없이도(검색로봇, 광고 심사) 내용이 보이고, 브라우저는 그 위에 이어 붙여요(`hydrateRoot`, `src/main.tsx`).
그래서 첫 화면은 서버와 브라우저에서 똑같아야 해요 — 렌더 중에 `window`·현재 시각·랜덤 값으로 갈라지지 말고 `useEffect`에서 처리해요.

## 고정 페이지

- `public/privacy/index.html` 개인정보처리방침 (정적 HTML). 광고·분석 도구를 붙이거나 바꾸면 글과 시행일을 같이 고쳐요.
- `public/robots.txt`. 사이트맵(`sitemap.xml`)은 빌드 때 `scripts/prerender.mjs`가 모든 페이지로 만들어요.

## 사용한 React Bits 컴포넌트

`src/components/reactbits/`에 원본을 복사해 두었어요 (MIT + Commons Clause, `LICENSE.md` 참고).

- Topography — 히어로 배경의 등고선 지형 (WebGL2)
- DecryptedText — 이름과 아카이브 번호가 해독되듯 나타나는 효과
- LogoLoop — 홈의 기술 스택 로고가 흐르는 줄

기술 로고는 [simple-icons](https://simpleicons.org/) (각 회사 상표, 쓰는 기술을 보여 주는 용도로만). C#처럼 없는 건 글자 배지.
