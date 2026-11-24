/**
 * 빌드 때 미리 그리기 (프리렌더) — npm run build 마지막 단계
 *   vite build              → dist/ (브라우저용)
 *   vite build --ssr        → dist-ssr/entry-server.js (화면을 HTML로 그리는 함수) + dist-ssr/news-load.js (content/news/*.md 읽기)
 *   이 파일                 → 페이지마다 dist/<주소>/index.html을 만듦 (제목·설명·대표 주소·공유 정보 + 미리 그린 화면)
 *                             + sitemap.xml, 뉴스 목록 JSON(news/index.json, 네코가 겹치는 주제를 피하려고 읽음), RSS(news/feed.xml)
 * 그러면 JS를 실행하지 않아도(검색로봇, 광고 심사, 공유 미리보기) 내용이 HTML에 들어 있어요.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

process.env.NODE_ENV ??= 'production'; // React 서버 렌더러를 배포용으로 (아래 import보다 먼저)

const SITE = 'https://beartanh.dev';
const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const dist = resolve(root, 'dist');
const ssr = (f) => import(pathToFileURL(resolve(root, 'dist-ssr', f)).href);
const { render, projects } = await ssr('entry-server.js');
const { loadNews, toMeta } = await ssr('news-load.js');
const news = loadNews(root);

const template = readFileSync(resolve(dist, 'index.html'), 'utf8');
const mark = '<div id="root"></div>';
if (!template.includes(mark)) throw new Error(`dist/index.html에 ${mark}가 없어요`);

// 글꼴 CSS(vite.config.ts의 fonts 입력 → assets/fonts-*.css)를 화면을 막지 않게 붙임
const fonts = readdirSync(resolve(dist, 'assets')).find((f) => /^fonts-.*\.css$/.test(f));
if (!fonts) throw new Error('dist/assets/fonts-*.css가 없어요 (vite.config.ts의 fonts 입력 확인)');
const fontLink = `<link rel="stylesheet" href="/assets/${fonts}" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="/assets/${fonts}"></noscript>`;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** <script> 안에 넣을 JSON (</script>로 끊기지 않게) */
const scriptJson = (v) => JSON.stringify(v).replace(/</g, '\\u003c');
const kstDay = (iso) => new Date(Date.parse(iso) + 9 * 3600_000).toISOString().slice(0, 10);

/** 페이지 목록: 주소 · 제목 · 설명 · 공유 이미지 · 사이트맵 날짜 */
const pages = [
  {
    path: '/',
    route: { kind: 'home' },
    title: 'BeartanH — 게임과 AI를 만드는 개발자',
    description: '게임 개발과 AI를 하는 개발자 다희(BeartanH)의 사이트예요. 직접 만들고 운영하는 프로젝트와, AI 비서 네코가 쓰는 뉴스가 있어요.',
    jsonLd: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'BeartanH', alternateName: ['beartanh.dev', '베어탄'], url: `${SITE}/` },
    lastmod: news[0] ? kstDay(news[0].date) : undefined
  },
  {
    path: '/projects/',
    route: { kind: 'projects' },
    title: '프로젝트 | BeartanH',
    description: `다희가 직접 만들고 운영하는 프로젝트 ${projects.length}개 — ${projects.map((p) => p.title).join(', ')}.`
  },
  ...projects.map((p) => ({
    path: `/projects/${p.slug}/`,
    route: { kind: 'project', slug: p.slug },
    title: `${p.title} — ${p.tagline} | BeartanH`,
    description: p.summary,
    image: p.image ? `${SITE}${p.image}` : undefined
  })),
  {
    path: '/news/',
    route: { kind: 'news' },
    title: '뉴스 | BeartanH',
    description: 'AI 비서 네코가 직접 주제를 고르고 쓰는 소식이에요. 글마다 출처 링크를 달아요.',
    lastmod: news[0] ? kstDay(news[0].date) : undefined
  },
  ...news.map((n) => ({
    path: `/news/${n.id}/`,
    route: { kind: 'article', id: n.id },
    article: n,
    title: `${n.title} | BeartanH 뉴스`,
    description: n.summary,
    type: 'article',
    lastmod: kstDay(n.date)
  }))
];

/** <head>의 제목·설명·대표 주소·공유 정보를 그 페이지 것으로 */
function head(html, p) {
  const url = `${SITE}${p.path}`;
  const set = (re, tag) => {
    if (!re.test(html)) throw new Error(`index.html에 ${re} 태그가 없어요`);
    html = html.replace(re, tag);
  };
  set(/<title>[\s\S]*?<\/title>/, `<title>${esc(p.title)}</title>`);
  set(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(p.description)}" />`);
  set(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${esc(url)}" />`);
  set(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${p.type ?? 'website'}" />`);
  set(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${esc(url)}" />`);
  set(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(p.title)}" />`);
  set(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(p.description)}" />`);
  if (p.image) set(/<meta property="og:image" [^>]*>/, `<meta property="og:image" content="${esc(p.image)}" />`);
  const extra = [fontLink];
  if (p.jsonLd) extra.push(`<script type="application/ld+json">${scriptJson(p.jsonLd)}</script>`);
  if (p.path.startsWith('/news/')) extra.push(`<link rel="alternate" type="application/rss+xml" title="BeartanH 뉴스" href="${SITE}/news/feed.xml" />`);
  return html.replace('</head>', `${extra.join('\n')}\n</head>`);
}

let bytes = 0;
for (const p of pages) {
  const app = render(p.route, p.article ?? null);
  bytes += app.length;
  // 뉴스 글: 본문을 브라우저가 이어 붙일 때 쓰도록 페이지에 같이 넣음 (화면 번들엔 목록만)
  const data = p.article ? `<script type="application/json" id="page-data">${scriptJson(p.article)}</script>` : '';
  const html = head(template, p).replace(mark, `<div id="root">${app}</div>${data}`);
  const out = resolve(dist, p.path.slice(1), 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}

// 사이트맵 (개인정보처리방침은 public/privacy 정적 페이지)
const urls = [...pages, { path: '/privacy/' }]
  .map((p) => `  <url><loc>${SITE}${p.path}</loc>${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ''}</url>`)
  .join('\n');
writeFileSync(resolve(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

// 뉴스 목록 JSON (네코가 이미 쓴 주제를 확인하는 용도) + RSS
mkdirSync(resolve(dist, 'news'), { recursive: true });
writeFileSync(resolve(dist, 'news/index.json'), JSON.stringify(news.map((n) => ({ ...toMeta(n), url: `${SITE}/news/${n.id}/` }))));
const items = news
  .slice(0, 30)
  .map(
    (n) => `  <item><title>${esc(n.title)}</title><link>${SITE}/news/${n.id}/</link><guid>${SITE}/news/${n.id}/</guid><pubDate>${new Date(n.date).toUTCString()}</pubDate><description>${esc(n.summary)}</description></item>`
  )
  .join('\n');
writeFileSync(
  resolve(dist, 'news/feed.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>BeartanH 뉴스</title><link>${SITE}/news/</link><description>AI 비서 네코가 쓰는 소식</description><language>ko</language>\n${items}\n</channel></rss>\n`
);

console.log(`프리렌더: ${pages.length}쪽 (홈·프로젝트 ${projects.length}·뉴스 ${news.length}), 평균 ${Math.round(bytes / pages.length / 1024)}KB + sitemap.xml·news/index.json·news/feed.xml`);
