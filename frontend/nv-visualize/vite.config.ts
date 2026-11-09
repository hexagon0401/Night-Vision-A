import { defineConfig } from "vitest/config";
export default defineConfig({
  base: process.env.NV_BASE_PATH ?? "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/maplibre-gl/")) return "maplibre";
          if (/node_modules\/@(deck|luma|loaders|math)\.gl\//.test(id))
            return "visualization";
        },
      },
    },
  },
  test: { include: ["tests/**/*.test.ts"] },
});
