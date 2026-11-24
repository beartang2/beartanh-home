/**
 * 홈: 게임 개발 · AI 두 축 소개 → 다루는 기술(로고가 흐르는 줄 + 분야별 목록) → 최근 프로젝트 → 네코의 뉴스
 */
import newsIndex from 'virtual:news-index';
import Topography from '../components/reactbits/Topography/Topography';
import DecryptedText from '../components/reactbits/DecryptedText/DecryptedText';
import LogoLoop, { type LogoItem } from '../components/reactbits/LogoLoop/LogoLoop';
import { BrandIcon, SectionHead } from '../components/Chrome';
import { NewsEmpty, NewsRow, ProjectTile } from '../components/Tiles';
import { projectsNewest } from '../data/projects';
import { stackAll, stackGroups, type StackItem } from '../data/stack';

const SCRAMBLE = '01<>/{}[]#$%&*+=';

function StackMark({ item, size = 22 }: { item: StackItem; size?: number }) {
  if (item.icon) return <BrandIcon path={item.icon.path} size={size} />;
  return (
    <span className="stack-badge mono" style={{ fontSize: Math.round(size * 0.55) }}>
      {item.badge}
    </span>
  );
}

const logos: LogoItem[] = stackAll.map((s) => ({
  node: (
    <span className="logo-item">
      <StackMark item={s} size={26} />
      <span className="logo-name">{s.name}</span>
    </span>
  ),
  title: s.name,
  ariaLabel: s.name,
  hoverColor: s.icon ? `#${s.icon.hex === '000000' || s.icon.hex === 'FFFFFF' ? 'e4ecf7' : s.icon.hex}` : undefined
}));

export default function Home() {
  const news = newsIndex.slice(0, 3);
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
            dpr={1.25}
          />
        </div>
        <div className="hero-body wrap">
          <p className="name mono">
            <DecryptedText text="BeartanH" parentClassName="decrypt" animateOn="inViewHover" sequential speed={55} characters={SCRAMBLE} encryptedClassName="enc" />
          </p>
          <h1 className="headline">
            게임을 만들고,
            <br />
            AI를 붙입니다.
          </h1>
          <p className="lead">개발자 다희예요. Unity로 게임을 만들고, LLM과 에이전트를 실제 서비스에 붙여요. 지금은 AI 비서 네코를 키우고 있어요.</p>
          <p className="cta">
            <a className="btn btn--primary" href="/projects/">
              프로젝트 보기
            </a>
            <a className="btn" href="/news/">
              네코의 뉴스
            </a>
          </p>
        </div>
      </header>

      <main className="wrap">
        <section aria-labelledby="focus">
          <SectionHead id="focus" title="관심 있는 것" />
          <div className="bento">
            <article className="bento-card bento-card--game">
              <p className="bento-kicker mono">GAME</p>
              <h3>게임 개발</h3>
              <p>
                Unity와 C#으로 게임을 만들어요. 친구들과 같이 노는 확률 강화 웹게임 <a href="/projects/ganghwa-rpg/">강화 RPG</a>를 직접 운영하고 있어요.
              </p>
            </article>
            <article className="bento-card bento-card--ai">
              <p className="bento-kicker mono">AI</p>
              <h3>AI · 에이전트</h3>
              <p>
                LLM을 서비스에 붙이는 일을 좋아해요. <a href="/projects/jjimhalkka/">찜할까?</a>는 Claude로 전 세계 게임 리뷰를 요약하고, 개인 AI 비서
                네코는 로컬 LLM과 Claude API로 대화하며 이 사이트에 뉴스를 써요.
              </p>
            </article>
          </div>
        </section>

        <section aria-labelledby="stack">
          <SectionHead id="stack" title="다루는 기술" />
          <div className="stack-loop">
            <LogoLoop logos={logos} speed={42} gap={44} logoHeight={30} fadeOut fadeOutColor="#0a1a2f" hoverSpeed={8} ariaLabel="다루는 기술" />
          </div>
          {/* 로고 줄은 움직이는 장식이라, 읽을 수 있는 목록을 분야별로 한 번 더 (검색로봇·JS 꺼진 화면도) */}
          <div className="stack-groups">
            {stackGroups.map((g) => (
              <div key={g.key} className="stack-group">
                <h3>{g.title}</h3>
                <ul>
                  {g.items.map((s) => (
                    <li key={s.name}>
                      <StackMark item={s} size={15} />
                      {s.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="recent">
          <SectionHead id="recent" title="최근 프로젝트" more={{ href: '/projects/', label: '모두 보기' }} />
          <div className="tile-grid tile-grid--3">
            {projectsNewest.slice(0, 3).map((p) => (
              <ProjectTile key={p.slug} p={p} />
            ))}
          </div>
        </section>

        <section aria-labelledby="latest">
          <SectionHead id="latest" title="네코의 뉴스" more={news.length ? { href: '/news/', label: '모두 보기' } : undefined} />
          {news.length ? (
            <div className="news-list">
              {news.map((n) => (
                <NewsRow key={n.id} n={n} />
              ))}
            </div>
          ) : (
            <NewsEmpty />
          )}
        </section>
      </main>
    </>
  );
}
