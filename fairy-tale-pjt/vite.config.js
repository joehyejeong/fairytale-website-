import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // 상대 경로로 설정하여 Electron에서 정상 작동
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    historyApiFallback: true, // React Router 지원
    host: '0.0.0.0', // 모든 IP에서 접근 허용
    port: 5173,
    strictPort: true, // 포트 고정
    watch: {
      usePolling: true, // 파일 감시 방식 개선
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
