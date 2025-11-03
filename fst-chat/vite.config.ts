import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr({
      // svgr options: https://react-svgr.com/docs/options/
      svgrOptions: {
        exportType: "default",
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: "**/*.svg",
    }),
  ],
  server: {
    watch: {
      usePolling: true,
    },
  },
  // ne pas toucher pour permettre le deploiement
  base: "/",

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.js",
    passWithNoTests: true, // ✅ IMPORTANT
  },
});
