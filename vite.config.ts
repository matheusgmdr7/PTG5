import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
    include: ["ai", "@ai-sdk/openai"],
  },
  resolve: {
    dedupe: ["ai", "@ai-sdk/openai"],
  },
})
