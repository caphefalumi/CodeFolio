import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { fileURLToPath, URL } from "node:url"
import "dotenv/config"

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	
	server: {
		port: 3000,
		hmr: {
			overlay: false,
		},
	},
	preview: {
   		port: 3000,
  	},
	build: {
		chunkSizeWarningLimit: 1600,
	}
})
