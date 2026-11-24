/**
 * 빌드 때만 (Node): content/news/*.md → 글 목록 + 본문 HTML
 *  - vite.config.ts가 목록(본문 빼고)을 virtual:news-index로 화면에 넣고, scripts/prerender.mjs가 글 페이지마다 본문 HTML을 넣음
 *  - 마크다운은 HTML 태그를 끈 채로(html: false) 바꿈 → 글에 스크립트가 섞여도 글자로만 보임
 *    링크는 https만, 새 탭 + nofollow(AI가 쓴 글이라 검색 점수를 넘기지 않음), 이미지는 넣지 않음, 제목은 한 단계 낮춤(#은 h2)
 *  - 이름이 _로 시작하는 파일은 미리보기 견본 (NEWS_SAMPLES=1일 때만)
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import { isHttpsUrl, validateNews } from './schema.ts';
import type { NewsArticle, NewsMeta } from './types.ts';

const md = new MarkdownIt({ html: false, linkify: true, typographer: false });
md.validateLink = (url: string) => isHttpsUrl(url);
md.renderer.rules.image = (tokens, idx) => md.utils.escapeHtml(tokens[idx]!.content);
md.renderer.rules.heading_open = (tokens, idx) => {
  const level = Math.min(6, Number(tokens[idx]!.tag.slice(1)) + 1);
  tokens[idx]!.tag = `h${level}`;
  const close = tokens.slice(idx).find((t) => t.type === 'heading_close');
  if (close) close.tag = `h${level}`;
  return `<h${level}>`;
};
const defaultLink = md.renderer.rules.link_open ?? ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  tokens[idx]!.attrSet('target', '_blank');
  tokens[idx]!.attrSet('rel', 'nofollow noopener noreferrer');
  return defaultLink(tokens, idx, options, env, self);
};

export function loadNews(root: string, { samples = process.env.NEWS_SAMPLES === '1' } = {}): NewsArticle[] {
  const dir = resolve(root, 'content/news');
  if (!existsSync(dir)) return [];
  const out: NewsArticle[] = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const sample = file.startsWith('_');
    if (sample && !samples) continue;
    const id = file.replace(/\.md$/, '').replace(/^_/, '');
    const { data, content } = matter(readFileSync(resolve(dir, file), 'utf8'));
    const check = validateNews({ ...data, body: content });
    if (!check.ok) throw new Error(`content/news/${file}: ${check.errors.join(' / ')}`);
    const v = check.value;
    const date = typeof data.date === 'string' ? data.date : new Date(data.date).toISOString();
    out.push({
      id,
      title: v.title,
      date,
      summary: v.summary,
      tags: v.tags,
      sources: v.sources,
      author: typeof data.author === 'string' ? data.author : '네코',
      html: md.render(v.body)
    });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

export const toMeta = ({ html: _html, ...meta }: NewsArticle): NewsMeta => meta;
