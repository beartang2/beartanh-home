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

## 사용한 React Bits 컴포넌트

`src/components/reactbits/`에 원본을 복사해 두었어요 (MIT + Commons Clause, `LICENSE.md` 참고).

- Topography — 히어로 배경의 등고선 지형 (WebGL2)
- DecryptedText — 이름과 아카이브 번호가 해독되듯 나타나는 효과
- SpotlightCard — 아카이브 카드의 마우스 스포트라이트
