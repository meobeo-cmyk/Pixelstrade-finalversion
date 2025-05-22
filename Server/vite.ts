import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";

import { fileURLToPath } from 'url';

const viteLogger = createLogger();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  try {
    // Đường dẫn tới project root và client
    const projectRoot = path.resolve(__dirname, "..");
    const clientRoot = path.resolve(projectRoot, "client");
    
    // Load vite config từ file và resolve nó
    const configPath = path.resolve(projectRoot, "vite.config.js");
    
    const vite = await createViteServer({
      configFile: configPath, // Để Vite tự load config file
      root: clientRoot,
      customLogger: viteLogger,
      server: {
        middlewareMode: true,
        hmr: { server },
        allowedHosts: true,
        fs: {
          // Cho phép serving files từ project root
          allow: [projectRoot]
        }
      },
      appType: "custom",
      // Override một số config nếu cần
      resolve: {
        alias: {
          "@": path.resolve(clientRoot, "src"),
          "@shared": path.resolve(projectRoot, "shared"),
          "@assets": path.resolve(projectRoot, "attached_assets"),
          "@/components": path.resolve(clientRoot, "src/components"),
          "@/lib": path.resolve(clientRoot, "src/lib"),
          "@/hooks": path.resolve(clientRoot, "src/hooks"),
        },
      },
    });

    app.use(vite.middlewares);

    // Handle SPA routing - serve index.html for all non-API routes
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;

      // Skip API routes
      if (url.startsWith('/api')) {
        return next();
      }

      try {
        const template = await fs.promises.readFile(
          path.resolve(clientRoot, "index.html"),
          "utf-8"
        );

        const page = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    log("Vite dev server setup completed");
    
    return vite;
  } catch (error) {
    console.error("Error setting up Vite:", error);
    throw error;
  }
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
