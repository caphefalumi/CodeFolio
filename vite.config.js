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
}) 