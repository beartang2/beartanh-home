/**
 * 모든 페이지 공통: 위에 떠 있는 유리 메뉴(홈·프로젝트·뉴스) + 바닥글
 * 메뉴는 sticky라 내려 읽어도 늘 보임. 넓은 화면에선 GitHub 아이콘까지, 폰에선 곰 + 탭 세 개만
 */
import { siGithub } from 'simple-icons';
import type { Route } from '../route';
import { tabOf } from '../route';

export function BearMark() {
  return (
    <svg className="bear" viewBox="0 0 11 9" shapeRendering="crispEdges" aria-hidden="true">
      <path className="f" d="M1 0h2v1h-2zM8 0h2v1h-2zM0 1h1v1h-1zM2 1h7v1h-7zM10 1h1v1h-1zM0 2h11v1h-11zM0 3h2v1h-2zM3 3h5v1h-5zM9 3h2v1h-2zM0 4h11v1h-11zM0 5h3v1h-3zM8 5h3v1h-3zM0 6h2v1h-2zM9 6h2v1h-2zM1 7h2v1h-2zM8 7h2v1h-2zM2 8h7v1h-7z" />
      <path className="m" d="M1 1h1v1h-1zM9 1h1v1h-1zM3 5h5v1h-5zM2 6h3v1h-3zM6 6h3v1h-3zM3 7h5v1h-5z" />
      <path className="e" d="M2 3h1v1h-1zM8 3h1v1h-1zM5 6h1v1h-1z" />
    </svg>
  );
}

export function BrandIcon({ path, size = 18, title }: { path: string; size?: number; title?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <path d={path} />
    </svg>
  );
}

const TABS = [
  { key: 'home', label: '홈', href: '/' },
  { key: 'projects', label: '프로젝트', href: '/projects/' },
  { key: 'news', label: '뉴스', href: '/news/' }
] as const;

export function Nav({ route }: { route: Route }) {
  const active = tabOf(route);
  return (
    <div className="nav-wrap">
      <nav className="nav-bar" aria-label="주요 메뉴">
        <a className="brand" href="/" aria-label="beartanh.dev 홈">
          <BearMark />
          <span className="mono">beartanh.dev</span>
        </a>
        <div className="tabs">
          {TABS.map((t) => (
            <a key={t.key} href={t.href} className={t.key === active ? 'tab is-active' : 'tab'} aria-current={t.key === active ? 'page' : undefined}>
              {t.label}
            </a>
          ))}
        </div>
        <a className="nav-gh" href="https://github.com/beartang2" aria-label="GitHub (beartang2)">
          <BrandIcon path={siGithub.path} />
        </a>
      </nav>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="wrap foot">
      <span className="mono">© 2026 BeartanH</span>
      <span className="foot-links">
        <a href="/projects/">프로젝트</a>
        <a href="/news/">뉴스</a>
        <a href="/privacy/">개인정보처리방침</a>
        <a className="mono" href="https://github.com/beartang2">github.com/beartang2</a>
      </span>
    </footer>
  );
}

/** 섹션 머리: 제목 + 오른쪽 '모두 보기' */
export function SectionHead({ id, title, more }: { id: string; title: string; more?: { href: string; label: string } }) {
  return (
    <div className="sec-head">
      <h2 id={id}>{title}</h2>
      {more && (
        <a className="more" href={more.href}>
          {more.label} <span aria-hidden="true">→</span>
        </a>
      )}
    </div>
  );
}
