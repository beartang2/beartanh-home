/**
 * 프로젝트 타일(애플 제품 카드처럼 큰 그림 + 글)과 뉴스 한 줄
 * 타일 전체가 상세 페이지 링크 (제목 링크의 ::after가 카드를 덮음)
 */
import { projectPath, statusLabel, type Project } from '../data/projects';
import { newsDateLabel, newsPath, type NewsMeta } from '../news/types';

export function ProjectMedia({ p, large = false }: { p: Project; large?: boolean }) {
  return (
    <div className={large ? 'media media--large' : 'media'} style={{ background: p.accent }}>
      {p.image ? (
        <img src={p.image} alt="" loading={large ? 'eager' : 'lazy'} decoding="async" width={1200} height={630} />
      ) : (
        <span className="media-title" aria-hidden="true">
          {p.title}
        </span>
      )}
    </div>
  );
}

export function StatusPill({ p }: { p: Project }) {
  return (
    <span className={`status status--${p.status}`}>
      <i className="pip" aria-hidden="true" />
      {statusLabel[p.status]}
    </span>
  );
}

export function Chips({ items }: { items: string[] }) {
  return (
    <ul className="chips">
      {items.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ul>
  );
}

export function ProjectTile({ p, large = false, headingLevel = 3 }: { p: Project; large?: boolean; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className={large ? 'tile tile--large' : 'tile'}>
      <ProjectMedia p={p} large={large} />
      <div className="tile-body">
        <div className="tile-meta">
          <StatusPill p={p} />
          <span className="mono tile-date">{p.date}</span>
        </div>
        <H className="tile-title">
          <a className="stretch" href={projectPath(p)}>
            {p.title}
          </a>
        </H>
        <p className="tile-tagline">{p.tagline}</p>
        {large && <p className="tile-summary">{p.summary}</p>}
        <Chips items={p.stack} />
      </div>
    </article>
  );
}

export function NewsRow({ n, headingLevel = 3 }: { n: NewsMeta; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className="news-row">
      <p className="news-meta">
        <time dateTime={n.date}>{newsDateLabel(n.date)}</time>
        {n.tags.length > 0 && <span> · {n.tags.join(' · ')}</span>}
      </p>
      <H className="news-title">
        <a className="stretch" href={newsPath(n)}>
          {n.title}
        </a>
      </H>
      <p className="news-summary">{n.summary}</p>
    </article>
  );
}

export function NewsEmpty() {
  return (
    <div className="news-empty">
      <p>네코가 첫 기사를 준비하고 있어요.</p>
    </div>
  );
}
