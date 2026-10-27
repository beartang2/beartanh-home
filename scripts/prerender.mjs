/**
 * 빌드 때 미리 그리기 (프리렌더) — npm run build 마지막 단계
 *   vite build                → dist/ (브라우저용)
 *   vite build --ssr …        → dist-ssr/entry-server.js (Node에서 화면을 HTML로 그리는 함수)
 *   이 파일                   → 그 HTML을 dist/index.html의 #root 안에 넣음
 * 그러면 JS를 실행하지 않아도(검색로봇, 광고 심사, 공유 미리보기) 내용이 HTML에 들어 있어요.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

process.env.NODE_ENV ??= 'production'; // React 서버 렌더러를 배포용으로 (아래 import보다 먼저)

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const htmlFile = resolve(root, 'dist/index.html');
const { render } = await import(pathToFileURL(resolve(root, 'dist-ssr/entry-server.js')).href);

const mark = '<div id="root"></div>';
const html = readFileSync(htmlFile, 'utf8');
if (!html.includes(mark)) throw new Error(`dist/index.html에 ${mark}가 없어요`);
const app = render();
// 글꼴 CSS(vite.config.ts의 fonts 입력 → assets/fonts-*.css)를 화면을 막지 않게 붙임:
// media="print"로 받기 시작해서 다 받으면 all로 → 그동안 글자는 기본 글꼴로 바로 보임. JS가 꺼져 있으면 noscript로
const fonts = readdirSync(resolve(root, 'dist/assets')).find((f) => /^fonts-.*\.css$/.test(f));
if (!fonts) throw new Error('dist/assets/fonts-*.css가 없어요 (vite.config.ts의 fonts 입력 확인)');
const fontLink = `<link rel="stylesheet" href="/assets/${fonts}" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="/assets/${fonts}"></noscript>`;
writeFileSync(htmlFile, html.replace(mark, `<div id="root">${app}</div>`).replace('</head>', `${fontLink}\n</head>`));
console.log(`프리렌더: dist/index.html (${Math.round(app.length / 1024)}KB)`);
