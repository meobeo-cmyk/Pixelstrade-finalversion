import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(async ({ mode }) => {
  const plugins = [react(), runtimeErrorOverlay()];

  if (mode !== "production" && process.env.REPL_ID !== undefined) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    plugins.push(cartographer());
  }

  return {
    base: "/Pixelstrade-finalversion/",
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "client/src"),
        "@shared": path.resolve(process.cwd(), "shared"),
        "@assets": path.resolve(process.cwd(), "attached_assets"),
        "@/components": path.resolve(process.cwd(), "client/src/components"),
        "@/lib": path.resolve(process.cwd(), "client/src/lib"),
        "@/hooks": path.resolve(process.cwd(), "client/src/hooks"),
      },
    },
    root: path.resolve(process.cwd(), "client"),
    build: {
      outDir: path.resolve(process.cwd(), "dist/public"),
      emptyOutDir: true,
    },
    server: {
      fs: {
        allow: [process.cwd()]
      }
    },
    // Thêm optimizeDeps để đảm bảo dependencies được pre-bundled đúng
    optimizeDeps: {
      include: ['react', 'react-dom']
    }
  };
});