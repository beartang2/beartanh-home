import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import '@fontsource/ibm-plex-sans-kr/400.css';
import '@fontsource/ibm-plex-sans-kr/600.css';
import './styles.css';
import App from './App';

const root = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// 빌드 때 미리 그린 HTML이 있으면(배포본) 그 위에 이어 붙이고, 없으면(개발 서버) 새로 그려요
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
