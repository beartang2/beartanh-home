/**
 * 페이지 구분 (라우터 라이브러리 없이 주소로): 홈 / 프로젝트 / 프로젝트 상세 / 뉴스 / 뉴스 글
 * 페이지마다 빌드 때 따로 미리 그린 HTML 파일이 있어서(scripts/prerender.mjs), 링크는 진짜 페이지 이동
 */
export type Route =
  | { kind: 'home' }
  | { kind: 'projects' }
  | { kind: 'project'; slug: string }
  | { kind: 'news' }
  | { kind: 'article'; id: string };

export function parseRoute(path: string): Route {
  const p = path.replace(/\/index\.html$/, '/');
  if (/^\/projects\/?$/.test(p)) return { kind: 'projects' };
  const pr = /^\/projects\/([a-z0-9-]+)\/?$/.exec(p);
  if (pr) return { kind: 'project', slug: pr[1]! };
  if (/^\/news\/?$/.test(p)) return { kind: 'news' };
  const nw = /^\/news\/([a-z0-9-]+)\/?$/.exec(p);
  if (nw) return { kind: 'article', id: nw[1]! };
  return { kind: 'home' };
}

/** 메뉴에서 어느 탭이 켜질지 */
export const tabOf = (r: Route): 'home' | 'projects' | 'news' =>
  r.kind === 'project' || r.kind === 'projects' ? 'projects' : r.kind === 'news' || r.kind === 'article' ? 'news' : 'home';

export const SITE_URL = 'https://beartanh.dev';
