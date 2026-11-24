/**
 * 뉴스 글 형식 — 네코가 발행 API(src/worker.ts)로 보내는 글과, 저장소의 글 파일(content/news/*.md)이 같은 규칙을 씀
 * 브라우저·Worker·빌드(Node) 어디서나 쓰도록 의존성 없음
 */

export interface NewsSource {
  title: string;
  url: string;
}

/** 네코가 보내는 값 (발행 API 요청 본문) */
export interface NewsInput {
  title: string;
  summary: string;
  /** 마크다운. 제목(#)은 화면에서 한 단계 낮춰 보여 줌, HTML 태그·이미지는 쓰지 않음 */
  body: string;
  tags: string[];
  sources: NewsSource[];
  /** 주소 꼬리 (영문 소문자·숫자·하이픈). 없으면 자동 */
  slug?: string;
}

export const LIMITS = {
  title: [5, 80],
  summary: [20, 200],
  body: [300, 20000],
  tags: 5,
  tag: 20,
  sources: [1, 8],
  sourceTitle: 120,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  slugLen: 60,
  /** 하루(한국 시간)에 올릴 수 있는 글 수 */
  perDay: 3
} as const;

const isStr = (v: unknown): v is string => typeof v === 'string';
const len = (s: string) => [...s].length;

/** https 주소만 (javascript:·http: 등은 거절) */
export function isHttpsUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === 'https:' && !!u.hostname && u.hostname.includes('.');
  } catch {
    return false;
  }
}

export function validateNews(x: unknown): { ok: true; value: NewsInput } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const o = (x && typeof x === 'object' ? x : {}) as Record<string, unknown>;
  const text = (key: 'title' | 'summary' | 'body', [min, max]: readonly [number, number]) => {
    const v = o[key];
    if (!isStr(v) || !v.trim()) return errors.push(`${key}: 비어 있어요`), '';
    const t = v.trim();
    if (len(t) < min || len(t) > max) errors.push(`${key}: ${min}~${max}자여야 해요 (지금 ${len(t)}자)`);
    return t;
  };
  const title = text('title', LIMITS.title).replace(/\s+/g, ' ');
  const summary = text('summary', LIMITS.summary).replace(/\s+/g, ' ');
  const body = text('body', LIMITS.body).replace(/\r\n/g, '\n');

  const tags: string[] = [];
  if (o.tags !== undefined) {
    if (!Array.isArray(o.tags)) errors.push('tags: 문자열 배열이어야 해요');
    else {
      for (const t of o.tags) {
        if (!isStr(t) || !t.trim() || len(t.trim()) > LIMITS.tag) errors.push(`tags: 각 ${LIMITS.tag}자 이하 글자여야 해요`);
        else if (!tags.includes(t.trim())) tags.push(t.trim());
      }
      if (tags.length > LIMITS.tags) errors.push(`tags: ${LIMITS.tags}개까지예요`);
    }
  }

  const sources: NewsSource[] = [];
  if (!Array.isArray(o.sources)) errors.push('sources: 출처 배열이 필요해요 (title, url)');
  else {
    for (const s of o.sources) {
      const so = (s && typeof s === 'object' ? s : {}) as Record<string, unknown>;
      if (!isStr(so.title) || !so.title.trim() || len(so.title) > LIMITS.sourceTitle) errors.push(`sources: title은 1~${LIMITS.sourceTitle}자`);
      else if (!isStr(so.url) || !isHttpsUrl(so.url)) errors.push(`sources: url은 https 주소여야 해요 (${String(so.url).slice(0, 80)})`);
      else sources.push({ title: so.title.trim(), url: so.url.trim() });
    }
    const [min, max] = LIMITS.sources;
    if (sources.length < min || sources.length > max) errors.push(`sources: ${min}~${max}개여야 해요`);
  }

  let slug: string | undefined;
  if (o.slug !== undefined) {
    if (!isStr(o.slug) || !LIMITS.slug.test(o.slug) || o.slug.length > LIMITS.slugLen)
      errors.push(`slug: 영문 소문자·숫자·하이픈, ${LIMITS.slugLen}자 이하`);
    else slug = o.slug;
  }

  // HTML 태그는 화면에서 글자로 보이므로 미리 막음 (스크립트 등). 마크다운만
  if (/<\s*\/?\s*[a-z][^>]*>/i.test(body)) errors.push('body: HTML 태그 대신 마크다운으로 써 주세요');
  if (/!\[[^\]]*\]\(/.test(body)) errors.push('body: 이미지는 넣지 않아요 (저작권). 링크로 걸어 주세요');

  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { title, summary, body, tags, sources, slug } };
}

/** 한국 시간 날짜 YYYY-MM-DD */
export const kstDate = (ms = Date.now()) => new Date(ms + 9 * 3_600_000).toISOString().slice(0, 10);

/** 글 파일 이름(확장자 빼고) = 주소 /news/<이것>/ */
export const newsId = (date: string, slug: string) => `${date}-${slug}`;

/** 저장소에 올릴 글 파일 내용. 앞머리는 YAML이지만 값은 JSON으로 써서 따옴표·줄바꿈 걱정 없음 */
export function toNewsFile(v: NewsInput, publishedAt: string, author: string): string {
  const head = [
    `title: ${JSON.stringify(v.title)}`,
    `date: ${JSON.stringify(publishedAt)}`,
    `summary: ${JSON.stringify(v.summary)}`,
    `tags: ${JSON.stringify(v.tags)}`,
    `sources: ${JSON.stringify(v.sources)}`,
    `author: ${JSON.stringify(author)}`
  ].join('\n');
  return `---\n${head}\n---\n\n${v.body.trim()}\n`;
}
