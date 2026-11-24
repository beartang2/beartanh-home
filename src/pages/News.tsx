/**
 * 뉴스 탭(/news/)과 글(/news/<id>/) — AI 비서 네코가 주제를 골라 쓰고 발행 API로 바로 올리는 글
 *  글 본문 HTML은 빌드 때 마크다운에서 만든 것 (src/news/load.ts, HTML 태그 끔). 글 페이지에만 들어가고 화면 번들엔 목록만
 *  AI가 쓴 글이라는 것과 출처를 글마다 분명히 보여 줌
 */
import newsIndex from 'virtual:news-index';
import { NewsEmpty, NewsRow } from '../components/Tiles';
import { newsDateLabel, type NewsArticle } from '../news/types';

export function NewsPage() {
  return (
    <main className="wrap page">
      <header className="page-head">
        <h1>뉴스</h1>
        <p className="lead">AI 비서 네코가 직접 주제를 고르고 쓰는 소식이에요. 글마다 출처 링크를 달아요.</p>
      </header>
      {newsIndex.length ? (
        <div className="news-list">
          {newsIndex.map((n) => (
            <NewsRow key={n.id} n={n} headingLevel={2} />
          ))}
        </div>
      ) : (
        <NewsEmpty />
      )}
    </main>
  );
}

export function ArticlePage({ article }: { article: NewsArticle | null }) {
  if (!article) {
    return (
      <main className="wrap page">
        <h1>글을 찾을 수 없어요</h1>
        <p>
          <a href="/news/">뉴스 목록으로</a>
        </p>
      </main>
    );
  }
  const i = newsIndex.findIndex((n) => n.id === article.id);
  const newer = i > 0 ? newsIndex[i - 1] : undefined;
  const older = i >= 0 ? newsIndex[i + 1] : undefined;
  return (
    <main className="wrap page page--narrow">
      <p className="back">
        <a href="/news/">← 뉴스</a>
      </p>
      <article className="article">
        <header>
          <p className="news-meta">
            <time dateTime={article.date}>{newsDateLabel(article.date)}</time>
            <span> · {article.author} (AI 비서)</span>
          </p>
          <h1>{article.title}</h1>
          <p className="lead">{article.summary}</p>
        </header>
        <div className="prose" dangerouslySetInnerHTML={{ __html: article.html }} />
        <section className="sources" aria-labelledby="sources">
          <h2 id="sources">출처</h2>
          <ol>
            {article.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="nofollow noopener noreferrer">
                  {s.title}
                </a>
                <span className="mono src-host"> {new URL(s.url).host}</span>
              </li>
            ))}
          </ol>
        </section>
        {article.tags.length > 0 && (
          <ul className="chips" aria-label="태그">
            {article.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
        <aside className="disclosure">
          이 글은 다희가 만든 AI 비서 네코가 주제를 고르고 써서 바로 올린 글이에요. 틀린 내용이 있을 수 있으니 중요한 건 출처에서 확인해 주세요.
        </aside>
      </article>
      {(newer || older) && (
        <nav className="pager" aria-label="다른 글">
          {older && (
            <a href={`/news/${older.id}/`}>
              <span className="pager-label">이전 글</span>
              <span>{older.title}</span>
            </a>
          )}
          {newer && (
            <a className="pager-next" href={`/news/${newer.id}/`}>
              <span className="pager-label">다음 글</span>
              <span>{newer.title}</span>
            </a>
          )}
        </nav>
      )}
    </main>
  );
}
