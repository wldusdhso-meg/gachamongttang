import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // react-quill 모듈 해석 보장
    dedupe: ['react', 'react-dom'],
    // 심볼릭 링크 보존 (운영서버에서 모듈 해석 문제 방지)
    preserveSymlinks: false,
    // 모듈 해석 조건 명시
    conditions: ['import', 'module', 'browser', 'default'],
    // 확장자 해석 순서
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  optimizeDeps: {
    include: ['react-quill', 'quill'],
    esbuildOptions: {
      // CommonJS 모듈 변환 강화
      resolveExtensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
  },
  build: {
    commonjsOptions: {
      include: [/react-quill/, /quill/, /node_modules/],
      transformMixedEsModules: true,
      // CommonJS require를 ESM import로 변환
      requireReturnsDefault: 'auto',
    },
    rollupOptions: {
      // react-quill을 externalize하지 않고 번들에 포함
      output: {
        manualChunks: undefined,
      },
      // 외부 의존성 해석 강화
      external: [],
      // 플러그인 설정 (node_modules 해석 강화)
      plugins: [],
    },
  },
  // SSR 모드 비활성화 (클라이언트 빌드만)
  ssr: {
    noExternal: ['react-quill', 'quill'],
  },
})
