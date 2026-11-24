/**
 * 프로젝트 탭(/projects/)과 프로젝트 상세(/projects/<slug>/)
 * 애플 제품 페이지처럼: 큰 그림 → 이름·한 줄 → 왜·어떻게·지금 → 쓴 기술 → 다른 프로젝트
 */
import { Chips, ProjectMedia, ProjectTile, StatusPill } from '../components/Tiles';
import { findProject, projectsNewest, type Project } from '../data/projects';

export function ProjectsPage() {
  const [first, ...rest] = projectsNewest;
  return (
    <main className="wrap page">
      <header className="page-head">
        <h1>프로젝트</h1>
        <p className="lead">직접 만들고 운영하는 것들이에요. 눌러서 왜 만들었는지, 어떻게 동작하는지 볼 수 있어요.</p>
      </header>
      {first && <ProjectTile p={first} large headingLevel={2} />}
      <div className="tile-grid tile-grid--2">
        {rest.map((p) => (
          <ProjectTile key={p.slug} p={p} headingLevel={2} />
        ))}
      </div>
    </main>
  );
}

function Prose({ title, paras }: { title: string; paras: string[] }) {
  if (!paras.length) return null;
  return (
    <section className="detail-sec">
      <h2>{title}</h2>
      {paras.map((t, i) => (
        <p key={i}>{t}</p>
      ))}
    </section>
  );
}

export function ProjectPage({ slug }: { slug: string }) {
  const p = findProject(slug);
  if (!p) {
    return (
      <main className="wrap page">
        <h1>프로젝트를 찾을 수 없어요</h1>
        <p>
          <a href="/projects/">프로젝트 목록으로</a>
        </p>
      </main>
    );
  }
  const others: Project[] = projectsNewest.filter((x) => x.slug !== p.slug).slice(0, 2);
  const host = p.url ? new URL(p.url).host : null;
  return (
    <main className="wrap page">
      <p className="back">
        <a href="/projects/">← 프로젝트</a>
      </p>
      <article className="detail">
        <ProjectMedia p={p} large />
        <header className="detail-head">
          <div className="tile-meta">
            <StatusPill p={p} />
            <span className="mono tile-date">{p.date}</span>
          </div>
          <h1>{p.title}</h1>
          <p className="lead">{p.tagline}</p>
          {p.url && (
            <p className="cta">
              <a className="btn btn--primary" href={p.url}>
                {host} 열기 <span aria-hidden="true">↗</span>
              </a>
            </p>
          )}
        </header>
        <p className="detail-summary">{p.summary}</p>
        <Prose title="왜 만들었나요" paras={p.why} />
        <Prose title="어떻게 동작하나요" paras={p.how} />
        <Prose title="지금은" paras={p.now} />
        <section className="detail-sec">
          <h2>쓴 기술</h2>
          <Chips items={p.stack} />
        </section>
      </article>
      {others.length > 0 && (
        <section aria-labelledby="others">
          <div className="sec-head">
            <h2 id="others">다른 프로젝트</h2>
          </div>
          <div className="tile-grid tile-grid--2">
            {others.map((o) => (
              <ProjectTile key={o.slug} p={o} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
