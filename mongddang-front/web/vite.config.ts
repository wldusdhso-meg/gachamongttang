import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // react-quill 모듈 해석 보장
      'react-quill': path.resolve(__dirname, 'node_modules/react-quill'),
    },
  },
  optimizeDeps: {
    include: ['react-quill'],
  },
})
