import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "/mediasoup/",
  server: {
    // 设置代理，根据你的实际需求修改
    port: 3000,
    proxy: {
      "/api": {
        target: "https://localhost/api/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  define: {
    // 设置 DEBUG 环境变量
    "process.env.DEBUG": JSON.stringify("*"),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "js/[name]-[hash].js", // 打包的文件名
        chunkFileNames: "js/[name]-[hash].js", // 代码分割后的文件名
        assetFileNames: "[ext]/[name]-[hash].[ext]", // 资源文件的文件名
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString();
          }
        },
      },
    },
  },
  publicDir: "public",
});
