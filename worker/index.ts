/**
 * beartanh.dev Worker — 정적 파일(dist/)은 그대로 내보내고, /api/*만 여기서 처리 (wrangler.jsonc run_worker_first)
 *
 * POST /api/news   네코(AI 비서)가 뉴스 글을 올림 → 검사 → 저장소 content/news/<날짜>-<slug>.md로 커밋
 *                  → GitHub main에 커밋되면 Workers Builds가 다시 빌드·배포 (보통 1~2분 뒤 /news/<id>/에 보임)
 * DELETE /api/news/<id>   네코가 올린 글 내리기 (잘못 쓴 글 정정용)
 *
 * 보안
 *  - 네코는 NEKO_TOKEN(발행 전용 비밀값)만 가짐. GitHub 토큰은 이 Worker 안에만 (GITHUB_TOKEN, 저장소 쓰기 권한)
 *    → 네코 쪽 값이 새도 할 수 있는 건 '형식에 맞는 글 올리기/내리기'뿐, 코드는 못 바꿈. 의심되면 NEKO_TOKEN만 바꾸면 됨
 *  - 글 형식·길이·출처(https)·HTML 태그 금지 검사(src/news/schema.ts), 하루 LIMITS.perDay개까지, 같은 주소 덮어쓰기 금지
 *  - 화면에 그릴 때도 마크다운의 HTML을 끄고 그림 (src/news/load.ts)
 * 비밀값: npx wrangler secret put NEKO_TOKEN / GITHUB_TOKEN (또는 Cloudflare 대시보드 → Workers → beartanh-home → 설정 → 변수 및 비밀)
 */
import { kstDate, LIMITS, newsId, toNewsFile, validateNews } from '../src/news/schema';

interface Env {
  ASSETS: Fetcher;
  NEKO_TOKEN: string;
  GITHUB_TOKEN: string;
  GITHUB_REPO: string; // "beartang2/beartanh-home"
  GITHUB_BRANCH: string; // "main"
  GITHUB_API?: string; // 시험용으로만 바꿈 (기본 https://api.github.com)
  NEWS_AUTHOR?: string; // 기본 "네코"
}

const NEWS_DIR = 'content/news';
const MAX_BODY_BYTES = 64 * 1024;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

async function authorized(req: Request, env: Env): Promise<boolean> {
  const want = env.NEKO_TOKEN ?? '';
  const got = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (want.length < 32 || got.length !== want.length) return false;
  const enc = new TextEncoder();
  return crypto.subtle.timingSafeEqual(enc.encode(got), enc.encode(want));
}

function gh(env: Env, path: string, init: RequestInit = {}) {
  const base = env.GITHUB_API ?? 'https://api.github.com';
  return fetch(`${base}/repos/${env.GITHUB_REPO}/${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'user-agent': 'beartanh-news-worker',
      ...(init.body ? { 'content-type': 'application/json' } : {})
    }
  });
}

/** UTF-8 문자열 → base64 (GitHub contents API) */
function b64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

async function listNewsFiles(env: Env): Promise<{ name: string; sha: string }[]> {
  const res = await gh(env, `contents/${NEWS_DIR}?ref=${encodeURIComponent(env.GITHUB_BRANCH)}`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub 목록 읽기 실패 (${res.status})`);
  const items = (await res.json()) as { name: string; sha: string; type: string }[];
  return items.filter((x) => x.type === 'file' && x.name.endsWith('.md'));
}

/** 주소 꼬리가 없으면: 시각 기반 짧은 꼬리 (한글 제목은 주소로 쓰기 어려워서) */
const autoSlug = () => `n${Date.now().toString(36)}`;

async function publish(req: Request, env: Env): Promise<Response> {
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json({ ok: false, errors: ['요청이 너무 커요 (64KB 이하)'] }, 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, errors: ['JSON이 아니에요'] }, 400);
  }
  const check = validateNews(body);
  if (!check.ok) return json({ ok: false, errors: check.errors }, 422);
  const v = check.value;

  const now = Date.now();
  const date = kstDate(now);
  const id = newsId(date, v.slug ?? autoSlug());
  const files = await listNewsFiles(env);
  if (files.some((f) => f.name === `${id}.md`)) return json({ ok: false, errors: [`이미 있는 주소예요: ${id}`] }, 409);
  const today = files.filter((f) => f.name.startsWith(`${date}-`)).length;
  if (today >= LIMITS.perDay) return json({ ok: false, errors: [`오늘은 이미 ${today}개를 올렸어요 (하루 ${LIMITS.perDay}개까지)`] }, 429);

  const author = env.NEWS_AUTHOR ?? '네코';
  const publishedAt = new Date(now).toISOString();
  const res = await gh(env, `contents/${NEWS_DIR}/${id}.md`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `news: ${v.title} (${author})`,
      content: b64(toNewsFile(v, publishedAt, author)),
      branch: env.GITHUB_BRANCH,
      committer: { name: `${author} (AI)`, email: 'neko@beartanh.dev' }
    })
  });
  if (!res.ok) return json({ ok: false, errors: [`GitHub에 올리지 못했어요 (${res.status})`] }, 502);
  return json({ ok: true, id, url: `https://beartanh.dev/news/${id}/`, note: '배포까지 보통 1~2분 걸려요' }, 201);
}

async function unpublish(id: string, env: Env): Promise<Response> {
  if (!/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(id)) return json({ ok: false, errors: ['주소 형식이 아니에요'] }, 400);
  const file = (await listNewsFiles(env)).find((f) => f.name === `${id}.md`);
  if (!file) return json({ ok: false, errors: ['없는 글이에요'] }, 404);
  const res = await gh(env, `contents/${NEWS_DIR}/${id}.md`, {
    method: 'DELETE',
    body: JSON.stringify({ message: `news: 내림 ${id}`, sha: file.sha, branch: env.GITHUB_BRANCH, committer: { name: '네코 (AI)', email: 'neko@beartanh.dev' } })
  });
  if (!res.ok) return json({ ok: false, errors: [`GitHub에서 지우지 못했어요 (${res.status})`] }, 502);
  return json({ ok: true, id });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(req);
    if (url.pathname === '/api/news' || url.pathname.startsWith('/api/news/')) {
      if (!(await authorized(req, env))) return json({ ok: false, errors: ['인증 실패'] }, 401);
      try {
        if (req.method === 'POST' && url.pathname === '/api/news') return await publish(req, env);
        const del = /^\/api\/news\/([^/]+)$/.exec(url.pathname);
        if (req.method === 'DELETE' && del) return await unpublish(del[1]!, env);
        return json({ ok: false, errors: ['지원하지 않는 요청이에요'] }, 405);
      } catch (e) {
        return json({ ok: false, errors: [e instanceof Error ? e.message : '알 수 없는 오류'] }, 500);
      }
    }
    return json({ ok: false, errors: ['없는 API예요'] }, 404);
  }
} satisfies ExportedHandler<Env>;
