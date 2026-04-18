import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: {
    port: 5173,
    /** Listen on LAN (0.0.0.0) so e.g. http://<this-pc-ip>:5173 works from phone on same Wi-Fi. */
    host: true,
  },
});
