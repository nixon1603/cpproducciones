import "dotenv/config";
import express from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import net from "net";
import multer from "multer";
import { nanoid } from "nanoid";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { sdk } from "./sdk";
import { getUserByOpenId } from "../db";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Ensure uploads directory exists
  const eventsUploadDir = path.join(UPLOADS_DIR, "events");
  fs.mkdirSync(eventsUploadDir, { recursive: true });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Serve uploaded files statically
  app.use("/uploads", express.static(UPLOADS_DIR));

  // File upload endpoint (admin only)
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
  app.post("/api/upload", upload.single("file"), async (req: any, res: any) => {
    try {
      const sessionUser = await sdk.authenticateRequest(req).catch(() => null);
      if (!sessionUser || sessionUser.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      if (!req.file) return res.status(400).json({ error: "No file" });
      const ext = req.file.originalname.split(".").pop() ?? "bin";
      const fileName = `${nanoid(12)}.${ext}`;
      const filePath = path.join(eventsUploadDir, fileName);
      fs.writeFileSync(filePath, req.file.buffer);
      const url = `/uploads/events/${fileName}`;
      console.log(`[Upload] Saved: ${url}`);
      return res.json({ url, key: `events/${fileName}` });
    } catch (e: any) {
      console.error("[Upload] Error:", e);
      return res.status(500).json({ error: e.message });
    }
  });

  // ─── Local admin login (development) ────────────────────────────────────
  app.post("/api/auth/local-login", async (req: any, res: any) => {
    try {
      const { password } = req.body ?? {};
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

      if (!password || password !== adminPassword) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }

      const openId = "local-admin";
      // Try to upsert admin user in DB (will silently fail if no DB)
      try {
        const { upsertUser } = await import("../db");
        await upsertUser({
          openId,
          name: "Admin Local",
          email: "admin@cpproducciones.com",
          loginMethod: "local",
          role: "admin",
          lastSignedIn: new Date(),
        });
      } catch (e) {
        console.warn("[LocalAuth] Could not upsert admin user in DB:", (e as Error).message);
      }

      // Create session JWT
      const sessionToken = await sdk.signSession(
        { openId, appId: process.env.VITE_APP_ID || "local-dev", name: "Admin Local" },
        { expiresInMs: 1000 * 60 * 60 * 24 * 365 } // 1 year
      );

      const { getSessionCookieOptions } = await import("./cookies");
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie("app_session_id", sessionToken, {
        ...cookieOptions,
        maxAge: 1000 * 60 * 60 * 24 * 365,
        sameSite: "lax",
        secure: false,
      });

      return res.json({ success: true });
    } catch (e: any) {
      console.error("[LocalAuth] Error:", e);
      return res.status(500).json({ error: e.message });
    }
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
