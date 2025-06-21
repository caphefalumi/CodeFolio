import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import mkcert from "vite-plugin-mkcert";
import { fileURLToPath, URL } from 'node:url'
import 'dotenv/config'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    mkcert()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: process.env.NODE_ENV === 'production' ? '/CodeFolio/' : '/',
  server: {
    port: process.env.CLIENT_PORT,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
}) 