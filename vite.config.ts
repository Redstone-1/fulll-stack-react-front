import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '^/api': {
        target: 'http://localhost:8000', //目标源，目标服务器，真实请求地址
        changeOrigin: true, // 支持跨域
        rewrite: (path) => path.replace(/^\/api/, ''), // 重写真实路径,替换/api
      }
    }
  }
})
