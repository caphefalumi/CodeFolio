import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { fileURLToPath, URL } from "node:url"
import "dotenv/config"
const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	server: {
		port: 3000,
		strictPort: true,
		host: host || false,
		hmr: host ? {
			protocol: "ws",
			host,
			port: 3000,
		} : undefined,
		watch: {
			ignored: [
				"**/node_modules/**",
				"**/dist/**",
				"**/build/**",
				"**/target/**",
				"**/.git/**",
				"**/src-tauri/**",
			],
		}
	},
	envPrefix: ["VITE_*", "TAURI_ENV_*"],
	build: {
		chunkSizeWarningLimit: 1600,
		minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
		sourcemap: !!process.env.TAURI_ENV_DEBUG,
	},
})
