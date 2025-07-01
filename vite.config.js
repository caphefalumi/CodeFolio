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
    port: 'https://server-codefolio.vercel.app/',
    proxy: {
      '/api': {
				target: 'https://server-codefolio.vercel.app/',
        // target: process.env.NODE_ENV === 'production' ? 'https://server-codefolio.vercel.app/' : 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
}) 