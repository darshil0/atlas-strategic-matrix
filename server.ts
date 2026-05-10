import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/sync/github", (req, res) => {
    // In a real app, this would use octokit with the token from req.body or secure env
    console.log("Syncing to GitHub:", req.body.title);
    res.json({ success: true, url: "https://github.com/atlas/missions/issues/1" });
  });

  app.post("/api/sync/jira", (req, res) => {
    console.log("Syncing to Jira:", req.body.title);
    res.json({ success: true, key: "ATL-101", url: "https://atlassian.net/browse/ATL-101" });
  });

  // Proxy routes for GitHub/Jira could go here if needed to avoid CORS
  // or use server-side tokens.

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
