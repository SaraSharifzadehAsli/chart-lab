import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "web",
  plugins: [react()],
  // Relative asset paths, so the build also works when GitHub Pages serves it
  // from /chart-lab/ rather than the root of a domain.
  base: "./",
  build: { outDir: "../dist", emptyOutDir: true },
});
