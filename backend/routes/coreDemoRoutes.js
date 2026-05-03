import express from "express";
import os from "os";
import path from "path";
import { EventEmitter } from "events";
import { fileURLToPath } from "url";

const router = express.Router();

// ── 0. Middleware to add Native HTTP Header Proof ───────────────────
router.use((req, res, next) => {
  res.setHeader("X-Server-Engine", "NodeJS-Native-HTTP-Module");
  next();
});

// ── 1. Events Module Setup ──────────────────────────────────────────
class NodeExplorerEmitter extends EventEmitter {}
const nodeEmitter = new NodeExplorerEmitter();

nodeEmitter.on("exploration_triggered", (data) => {
  console.log(`[CORE_EVENT] Node modules explored at ${new Date().toLocaleTimeString()} by ID: ${data.id}`);
});

// ── 2. Path Module Setup ────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ══════════════════════════════════════════════════════════════════════
// ROUTE A — GET /api/core-demo/os
// ══════════════════════════════════════════════════════════════════════
router.get("/os", (req, res) => {
  res.json({
    module: "OS (Operating System)",
    data: {
      platform: os.platform(),
      architecture: os.arch(),
      cpuCount: os.cpus().length,
      model: os.cpus()[0].model,
      upTime_Hours: (os.uptime() / 3600).toFixed(2),
      totalMemory_GB: (os.totalmem() / (1024 ** 3)).toFixed(2),
      freeMemory_GB: (os.freemem() / (1024 ** 3)).toFixed(2),
      systemVersion: os.release()
    }
  });
});

// ══════════════════════════════════════════════════════════════════════
// ROUTE B — GET /api/core-demo/path
// ══════════════════════════════════════════════════════════════════════
router.get("/path", (req, res) => {
  res.json({
    module: "Path (File Path Utilities)",
    data: {
      currentDirectory: __dirname,
      currentFileName: path.basename(__filename),
      fileExtension: path.extname(__filename),
      normalizedProjectRoot: path.resolve(".."),
      joinedPathExample: path.join(__dirname, "demo", "output.txt"),
      pathSeparator: path.sep,
      delimiter: path.delimiter
    }
  });
});

// ══════════════════════════════════════════════════════════════════════
// ROUTE C — GET /api/core-demo/events
// ══════════════════════════════════════════════════════════════════════
router.get("/events", (req, res) => {
  const eventId = Math.random().toString(36).substr(2, 5);
  
  // Trigger the event
  nodeEmitter.emit("exploration_triggered", { id: eventId });

  res.json({
    module: "Events (EventEmitter)",
    message: "A custom 'exploration_triggered' event has been emitted!",
    eventID_Generated: eventId,
    timestamp: new Date().toISOString(),
    instruction: "Check your backend terminal console to see the '[CORE_EVENT]' log."
  });
});

export default router;
