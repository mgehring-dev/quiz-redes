import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  envPrefix: "REACT_APP_",
  server: {
    port: 3010,
    strictPort: true,
  },
  plugins: [react()],
});
