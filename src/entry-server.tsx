/**
 * 빌드 때 미리 그리기(프리렌더)용 입구. scripts/prerender.mjs가 이 함수로 화면을 HTML 문자열로 받아 dist/index.html에 넣어요.
 * JS를 실행하지 않는 검색로봇·광고 심사도 소개와 프로젝트 목록을 읽을 수 있게 하려는 것.
 * main.tsx와 같은 트리여야 브라우저가 그 위에 이어 붙일 수 있어요(hydrate).
 */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
