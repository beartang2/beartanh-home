import type { CSSProperties } from 'react';
import Topography from './components/reactbits/Topography/Topography';
import DecryptedText from './components/reactbits/DecryptedText/DecryptedText';
import SpotlightCard from './components/reactbits/SpotlightCard/SpotlightCard';
import { nextProjectId, projects, statusLabel, type Project } from './data/projects';

const SCRAMBLE = '01<>/{}[]#$%&*+=';

// 모바일에서는 WebGL 해상도를 낮춰 배터리 소모를 줄여요
const isSmall = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;

const cardStyle = {
  '--spotlight-card-surface': 'var(--panel)',
  '--spotlight-card-border': 'var(--line)',
  '--spotlight-card-shadow': 'none'
} as CSSProperties;

function BearMark() {
  return (
    <svg className="bear" viewBox="0 0 11 9" shapeRendering="crispEdges" aria-hidden="true">
      <path className="f" d="M1 0h2v1h-2zM8 0h2v1h-2zM0 1h1v1h-1zM2 1h7v1h-7zM10 1h1v1h-1zM0 2h11v1h-11zM0 3h2v1h-2zM3 3h5v1h-5zM9 3h2v1h-2zM0 4h11v1h-11zM0 5h3v1h-3zM8 5h3v1h-3zM0 6h2v1h-2zM9 6h2v1h-2zM1 7h2v1h-2zM8 7h2v1h-2zM2 8h7v1h-7z" />
      <path className="m" d="M1 1h1v1h-1zM9 1h1v1h-1zM3 5h5v1h-5zM2 6h3v1h-3zM6 6h3v1h-3zM3 7h5v1h-5z" />
      <path className="e" d="M2 3h1v1h-1zM8 3h1v1h-1zM5 6h1v1h-1z" />
    </svg>
  );
}

function Entry({ project }: { project: Project }) {
  const host = project.url ? new URL(project.url).host : null;
  return (
    <SpotlightCard
      className={`entry entry--${project.status}`}
      spotlightColor="#f2b33d"
      intensity={0.1}
      borderGlow={0.8}
      spotlightSize={320}
      style={cardStyle}
    >
      <div className="entry-meta">
        <span className="entry-id mono">
          <DecryptedText text={project.id} animateOn="view" sequential speed={60} characters={SCRAMBLE} parentClassName="decrypt" />
        </span>
        <span className="entry-date mono">{project.date}</span>
      </div>
      <div className="entry-body">
        <div className="entry-head">
          <h3>
            {project.url ? (
              <a className="stretch" href={project.url}>
                {project.title}
              </a>
            ) : (
              project.title
            )}
          </h3>
          <span className="status">
            <i className="pip" aria-hidden="true" />
            {statusLabel[project.status]}
          </span>
        </div>
        <p className="entry-summary">{project.summary}</p>
        <dl className="entry-spec">
          <div>
            <dt>스택</dt>
            <dd>{project.stack.join(', ')}</dd>
          </div>
          {host && (
            <div>
              <dt>주소</dt>
              <dd className="mono host">{host}</dd>
            </div>
          )}
        </dl>
      </div>
    </SpotlightCard>
  );
}

export default function App() {
  const nextId = nextProjectId;

  return (
    <>
      <header className="hero">
        <div className="hero-bg" aria-hidden="true">
          <Topography
            color="#7fb2ff"
            lineCount={22}
            lineWidth={1.1}
            glow={0.45}
            opacity={0.7}
            speed={0.12}
            tilt={38}
            fog={0.45}
            markers="plus"
            hoverEffect="trace"
            clickEffect="pulse"
            dpr={isSmall ? 1 : 1.5}
          />
        </div>

        <nav className="topbar wrap" aria-label="주요 메뉴">
          <a className="brand" href="/" aria-label="beartanh.dev 홈">
            <BearMark />
            <span className="mono">beartanh.dev</span>
          </a>
          <div className="nav-links">
            <a href="#archive">아카이브</a>
            <a href="#kit">다루는 것</a>
            <a href="https://github.com/beartang2">GitHub</a>
          </div>
        </nav>

        <div className="hero-body wrap">
          <h1 className="name mono">
            <DecryptedText
              text="BeartanH"
              parentClassName="decrypt"
              animateOn="inViewHover"
              sequential
              speed={55}
              characters={SCRAMBLE}
              encryptedClassName="enc"
            />
          </h1>
          <p className="intro">다희. 게임, 웹, AI를 만드는 개발자예요.</p>
          <p className="intro-sub">만들고 운영해 본 것들을 여기에 기록합니다.</p>
        </div>
      </header>

      <main className="wrap">
        <section id="archive" className="archive-section" aria-labelledby="archive-title">
          <div className="section-head">
            <h2 id="archive-title">프로젝트 아카이브</h2>
            <span className="count mono">{String(projects.length).padStart(2, '0')} records</span>
          </div>

          <ol className="archive">
            {projects.map(project => (
              <li key={project.id}>
                <Entry project={project} />
              </li>
            ))}
            <li>
              <div className="entry entry--empty">
                <div className="entry-meta">
                  <span className="entry-id mono">{nextId}</span>
                </div>
                <div className="entry-body">
                  <p className="entry-summary">다음 기록을 준비하고 있어요.</p>
                </div>
              </div>
            </li>
          </ol>
        </section>

        <section id="kit" className="kit-section" aria-labelledby="kit-title">
          <h2 id="kit-title">다루는 것</h2>
          <dl className="kit">
            <div>
              <dt>게임</dt>
              <dd>Unity, C#</dd>
            </div>
            <div>
              <dt>웹</dt>
              <dd>풀스택 개발, Linux, Docker</dd>
            </div>
            <div>
              <dt>AI</dt>
              <dd>LLM 연동, AI 에이전트</dd>
            </div>
          </dl>
        </section>
      </main>

      <footer className="wrap foot">
        <span className="mono">© 2026 BeartanH</span>
        <span className="foot-links">
          <a href="/privacy/">개인정보처리방침</a>
          <a className="mono" href="https://github.com/beartang2">github.com/beartang2</a>
        </span>
      </footer>
    </>
  );
}
