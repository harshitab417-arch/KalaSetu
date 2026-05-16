import express from "express";
import { getOsInfo, getPathInfo, triggerEvent } from "../controllers/coreDemoController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Core Demo
 *   description: Demo endpoints showcasing Node.js core module capabilities
 */

// Middleware: add Native HTTP Header Proof
router.use((req, res, next) => {
  res.setHeader("X-Server-Engine", "NodeJS-Native-HTTP-Module");
  next();
});

/**
 * @swagger
 * /api/core-demo/os:
 *   get:
 *     summary: Get OS information from the server
 *     tags: [Core Demo]
 *     security: []
 *     responses:
 *       200:
 *         description: OS details returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 platform:
 *                   type: string
 *                   example: linux
 *                 arch:
 *                   type: string
 *                   example: x64
 *                 cpus:
 *                   type: integer
 *                   example: 4
 *                 totalMemoryMB:
 *                   type: number
 *                 freeMemoryMB:
 *                   type: number
 *                 uptime:
 *                   type: number
 *                 hostname:
 *                   type: string
 */
router.get("/os", getOsInfo);

/**
 * @swagger
 * /api/core-demo/path:
 *   get:
 *     summary: Get server path information
 *     tags: [Core Demo]
 *     security: []
 *     responses:
 *       200:
 *         description: Path details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dirname:
 *                   type: string
 *                 basename:
 *                   type: string
 *                 extname:
 *                   type: string
 *                 join:
 *                   type: string
 */
router.get("/path", getPathInfo);

/**
 * @swagger
 * /api/core-demo/events:
 *   get:
 *     summary: Trigger a custom Node.js EventEmitter event (demo)
 *     tags: [Core Demo]
 *     security: []
 *     responses:
 *       200:
 *         description: Event triggered and log returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 log:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get("/events", triggerEvent);

export default router;
