import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import { loadNews, toMeta } from './src/news/load.ts'

/** content/news/*.md → 글 목록(본문 빼고)을 화면 번들에 (virtual:news-index). 본문은 글 페이지 HTML에만 (scripts/prerender.mjs) */
function newsIndex(): Plugin {
  const id = 'virtual:news-index'
  return {
    name: 'beartanh-news-index',
    resolveId: (src) => (src === id ? '\0' + id : null),
    load(src) {
      if (src !== '\0' + id) return null
      this.addWatchFile(resolve(import.meta.dirname, 'content/news'))
      return `export default ${JSON.stringify(loadNews(import.meta.dirname).map(toMeta))};`
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), newsIndex()],
  // 글꼴 CSS는 화면 CSS와 따로 (assets/fonts-*.css) → prerender.mjs가 화면을 막지 않게 늦게 붙임
  // 미리 그리기용 Node 번들(dist-ssr/): 화면 그리기 + 뉴스 글 읽기 (scripts/prerender.mjs가 씀)
  build: {
    rollupOptions: {
      input: (isSsrBuild
        ? { 'entry-server': resolve(import.meta.dirname, 'src/entry-server.tsx'), 'news-load': resolve(import.meta.dirname, 'src/news/load.ts') }
        : { main: resolve(import.meta.dirname, 'index.html'), fonts: resolve(import.meta.dirname, 'src/fonts.css') }) as Record<string, string>,
    },
  },
}))
