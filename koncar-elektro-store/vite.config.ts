import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const wpProxyTarget = (
    env.WP_REWRITE_ORIGIN ||
    env.VITE_WP_API_URL?.replace(/\/wp-json\/?$/, "") ||
    env.NEXT_PUBLIC_WP_API_URL?.replace(/\/wp-json\/?$/, "") ||
    "https://koncarelektro.rs"
  ).replace(/\/$/, "");

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      proxy: {
        "/wp-json": {
          target: wpProxyTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
  };
});
