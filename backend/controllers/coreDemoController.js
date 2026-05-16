import os from "os";
import path from "path";
import { EventEmitter } from "events";
import { fileURLToPath } from "url";

// ── Path setup ───────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── EventEmitter setup ───────────────────────────────────────────────
class NodeExplorerEmitter extends EventEmitter {}
export const nodeEmitter = new NodeExplorerEmitter();

nodeEmitter.on("exploration_triggered", (data) => {
  console.log(`[CORE_EVENT] Node modules explored at ${new Date().toLocaleTimeString()} by ID: ${data.id}`);
});

// ── GET /api/core-demo/os ─────────────────────────────────────────────
export const getOsInfo = (req, res) => {
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
      systemVersion: os.release(),
    },
  });
};

// ── GET /api/core-demo/path ───────────────────────────────────────────
export const getPathInfo = (req, res) => {
  res.json({
    module: "Path (File Path Utilities)",
    data: {
      currentDirectory: __dirname,
      currentFileName: path.basename(__filename),
      fileExtension: path.extname(__filename),
      normalizedProjectRoot: path.resolve(".."),
      joinedPathExample: path.join(__dirname, "demo", "output.txt"),
      pathSeparator: path.sep,
      delimiter: path.delimiter,
    },
  });
};

// ── GET /api/core-demo/events ─────────────────────────────────────────
export const triggerEvent = (req, res) => {
  const eventId = Math.random().toString(36).substr(2, 5);
  nodeEmitter.emit("exploration_triggered", { id: eventId });

  res.json({
    module: "Events (EventEmitter)",
    message: "A custom 'exploration_triggered' event has been emitted!",
    eventID_Generated: eventId,
    timestamp: new Date().toISOString(),
    instruction: "Check your backend terminal console to see the '[CORE_EVENT]' log.",
  });
};
