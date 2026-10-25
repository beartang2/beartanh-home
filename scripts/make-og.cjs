/**
 * 공유 미리보기 이미지 public/og.png (1200×630) 만들기. 디자인·프로젝트 목록을 바꿀 때만 다시 실행하고 결과를 커밋.
 *   node scripts/make-og.cjs   (Playwright가 깔린 곳에서. 글꼴은 node_modules의 @fontsource)
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const nm = (p) => 'file://' + path.join(root, 'node_modules', p);
const bear = `<svg viewBox="0 0 11 9" shape-rendering="crispEdges" width="88" height="72">
<path fill="#b8763c" d="M1 0h2v1h-2zM8 0h2v1h-2zM0 1h1v1h-1zM2 1h7v1h-7zM10 1h1v1h-1zM0 2h11v1h-11zM0 3h2v1h-2zM3 3h5v1h-5zM9 3h2v1h-2zM0 4h11v1h-11zM0 5h3v1h-3zM8 5h3v1h-3zM0 6h2v1h-2zM9 6h2v1h-2zM1 7h2v1h-2zM8 7h2v1h-2zM2 8h7v1h-7z"/>
<path fill="#e8c39a" d="M1 1h1v1h-1zM9 1h1v1h-1zM3 5h5v1h-5zM2 6h3v1h-3zM6 6h3v1h-3zM3 7h5v1h-5z"/>
<path fill="#1a1a1a" d="M2 3h1v1h-1zM8 3h1v1h-1zM5 6h1v1h-1z"/></svg>`;
const rings = Array.from({ length: 9 }, (_, i) => `<ellipse cx="1010" cy="300" rx="${70 + i * 46}" ry="${42 + i * 28}" fill="none" stroke="#7fb2ff" stroke-opacity="${0.42 - i * 0.04}" stroke-width="1.4"/>`).join('');
const projects = require('fs').readFileSync(path.join(root, 'src/data/projects.ts'), 'utf8');
const rows = [...projects.matchAll(/id: '(P-\d+)',\s*title: '([^']+)'/g)].map(([, id, t]) => `<li><b>${id}</b>${t}</li>`).join('');

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${nm('@fontsource/ibm-plex-mono/600.css')}">
<link rel="stylesheet" href="${nm('@fontsource/ibm-plex-mono/400.css')}">
<link rel="stylesheet" href="${nm('@fontsource/ibm-plex-sans-kr/600.css')}">
<style>*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:#0a1a2f;background-image:linear-gradient(rgba(127,178,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(127,178,255,.06) 1px,transparent 1px);background-size:30px 30px;color:#e4ecf7;font-family:'IBM Plex Sans KR',sans-serif;position:relative}
svg.bg{position:absolute;inset:0}
.wrap{position:absolute;left:88px;top:92px;right:88px}
h1{font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:124px;letter-spacing:-.03em;line-height:1;margin-top:28px}
p{font-size:38px;font-weight:600;color:#8ba3c1;margin-top:22px;letter-spacing:-.01em}
ul{list-style:none;padding:0;margin-top:40px;display:flex;gap:28px;font-size:26px;color:#c9d6e8}
ul b{font-family:'IBM Plex Mono',monospace;font-weight:400;color:#f2b33d;margin-right:10px}
.host{position:absolute;right:88px;bottom:56px;font-family:'IBM Plex Mono',monospace;font-size:28px;color:#8ba3c1}</style></head>
<body><svg class="bg" width="1200" height="630">${rings}</svg>
<div class="wrap">${bear}<h1>BeartanH</h1><p>다희 · 게임, 웹, AI를 만드는 개발자</p><ul>${rows}</ul></div>
<div class="host">beartanh.dev</div></body></html>`;

(async () => {
  const tmp = path.join(root, 'scripts', '.og.html');
  fs.writeFileSync(tmp, html);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto('file://' + tmp);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(root, 'public', 'og.png') });
  await browser.close();
  fs.unlinkSync(tmp);
  console.log('만듦: public/og.png');
})();
