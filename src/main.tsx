import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './styles.css';
import App from './App';

// 글꼴은 빌드에선 따로 늦게 붙임 (src/fonts.css, scripts/prerender.mjs). 개발 서버에선 여기서 불러옴
if (import.meta.env.DEV) import('./fonts.css');

const root = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// 빌드 때 미리 그린 HTML이 있으면(배포본) 그 위에 이어 붙이고, 없으면(개발 서버) 새로 그려요
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
