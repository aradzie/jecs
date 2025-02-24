import { defineConfig } from "vite";

export default defineConfig({
  base: "/jecs/",
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          katex: ["katex", "katex/dist/katex.css"],
          marked: ["marked"],
        },
      },
    },
  },
});
