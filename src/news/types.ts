import type { NewsSource } from './schema';

/** 목록·홈에 쓰는 글 정보 (본문 빼고). 화면 번들에 들어감 (virtual:news-index) */
export interface NewsMeta {
  /** 주소 /news/<id>/ = 파일 이름 */
  id: string;
  title: string;
  /** 발행 시각 ISO */
  date: string;
  summary: string;
  tags: string[];
  sources: NewsSource[];
  author: string;
}

/** 글 페이지용: 본문 HTML 포함 (빌드 때 마크다운 → HTML, 페이지 HTML에만 넣음) */
export interface NewsArticle extends NewsMeta {
  html: string;
}

export const newsPath = (n: Pick<NewsMeta, 'id'>) => `/news/${n.id}/`;

/** "2026-11-24T10:00:00+09:00" → "2026년 11월 24일" (한국 시간, 서버·브라우저 같은 값) */
export function newsDateLabel(iso: string): string {
  const d = new Date(Date.parse(iso) + 9 * 3_600_000).toISOString();
  return `${d.slice(0, 4)}년 ${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일`;
}
