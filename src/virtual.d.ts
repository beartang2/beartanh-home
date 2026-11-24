declare module 'virtual:news-index' {
  import type { NewsMeta } from './news/types';
  /** content/news/*.md의 글 목록 (최신순, 본문 빼고) — vite.config.ts newsIndex 플러그인 */
  const list: NewsMeta[];
  export default list;
}
