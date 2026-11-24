/**
 * 화면의 맨 바깥: 위 유리 메뉴 + 페이지 + 바닥글
 * 브라우저(main.tsx)와 빌드 때 미리 그리기(entry-server.tsx)가 같은 트리를 씀 → 미리 그린 HTML 위에 그대로 이어 붙임(hydrate)
 * 어느 페이지인지(route)와 글 본문(article)은 밖에서 받음 (브라우저는 주소와 페이지에 넣어 둔 데이터로)
 */
import { Footer, Nav } from './components/Chrome';
import type { NewsArticle } from './news/types';
import Home from './pages/Home';
import { ArticlePage, NewsPage } from './pages/News';
import { ProjectPage, ProjectsPage } from './pages/Projects';
import type { Route } from './route';

export default function App({ route, article = null }: { route: Route; article?: NewsArticle | null }) {
  return (
    <>
      <Nav route={route} />
      {route.kind === 'home' && <Home />}
      {route.kind === 'projects' && <ProjectsPage />}
      {route.kind === 'project' && <ProjectPage slug={route.slug} />}
      {route.kind === 'news' && <NewsPage />}
      {route.kind === 'article' && <ArticlePage article={article} />}
      <Footer />
    </>
  );
}
