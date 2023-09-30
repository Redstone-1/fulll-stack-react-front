import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    // vite 配置
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    server: {
      proxy: {
        '^/api': {
          target: 'http://localhost:8000', // 目标源，目标服务器，真实请求地址
          changeOrigin: true, // 支持跨域
          rewrite: (p) => p.replace(/^\/api/, ''), // 重写真实路径,替换 /api
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@request': path.resolve(__dirname, './src/request'),
        '@routes': path.resolve(__dirname, './src/routes'),
      },
    }
  }
})
