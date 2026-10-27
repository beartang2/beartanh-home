import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  // 글꼴 CSS는 화면 CSS와 따로 (assets/fonts-*.css) → prerender.mjs가 화면을 막지 않게 늦게 붙임
  build: isSsrBuild ? {} : { rollupOptions: { input: { main: resolve(__dirname, 'index.html'), fonts: resolve(__dirname, 'src/fonts.css') } } },
}))
