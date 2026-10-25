/**
 * 빌드 때 미리 그리기 (프리렌더) — npm run build 마지막 단계
 *   vite build                → dist/ (브라우저용)
 *   vite build --ssr …        → dist-ssr/entry-server.js (Node에서 화면을 HTML로 그리는 함수)
 *   이 파일                   → 그 HTML을 dist/index.html의 #root 안에 넣음
 * 그러면 JS를 실행하지 않아도(검색로봇, 광고 심사, 공유 미리보기) 내용이 HTML에 들어 있어요.
 */
import { readFileSync, writeFileSync } from 'node:fs';
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
writeFileSync(htmlFile, html.replace(mark, `<div id="root">${app}</div>`));
console.log(`프리렌더: dist/index.html (${Math.round(app.length / 1024)}KB)`);
