import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  blockUser,
  unblockUser,
  getBlockedUsers,
  getBlockedIds,
  getBlockStatus,
  reportUser,
  getAdminReports,
  updateAdminReport,
} from "../controllers/reportController.js";

// Re-export shared helper so other modules can import it from here (backward compat)
export { isBlockedInAnyDirection } from "../controllers/reportController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports & Blocks
 *   description: User blocking, reporting, and admin moderation
 */

/**
 * @swagger
 * /reports/block/{userId}:
 *   post:
 *     summary: Block a user
 *     tags: [Reports & Blocks]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User blocked successfully
 *       400:
 *         description: Already blocked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/block/:userId", requireAuth, blockUser);

/**
 * @swagger
 * /reports/unblock/{userId}:
 *   post:
 *     summary: Unblock a previously blocked user
 *     tags: [Reports & Blocks]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unblocked
 */
router.post("/unblock/:userId", requireAuth, unblockUser);

/**
 * @swagger
 * /reports/blocked:
 *   get:
 *     summary: Get full list of users blocked by the authenticated user
 *     tags: [Reports & Blocks]
 *     responses:
 *       200:
 *         description: Array of blocked user objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/blocked", requireAuth, getBlockedUsers);

/**
 * @swagger
 * /reports/blocked-ids:
 *   get:
 *     summary: Get just the IDs of all users blocked by authenticated user
 *     tags: [Reports & Blocks]
 *     responses:
 *       200:
 *         description: Array of blocked user IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get("/blocked-ids", requireAuth, getBlockedIds);

/**
 * @swagger
 * /reports/block-status/{userId}:
 *   get:
 *     summary: Check the block status between authenticated user and target user
 *     tags: [Reports & Blocks]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Block status result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blockedByMe:
 *                   type: boolean
 *                 blockedByThem:
 *                   type: boolean
 */
router.get("/block-status/:userId", requireAuth, getBlockStatus);

/**
 * @swagger
 * /reports/report/{userId}:
 *   post:
 *     summary: Report a user for a violation
 *     tags: [Reports & Blocks]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Harassment
 *               details:
 *                 type: string
 *                 example: This user sent offensive messages.
 *     responses:
 *       201:
 *         description: Report submitted
 *       400:
 *         description: Already reported
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/report/:userId", requireAuth, reportUser);

/**
 * @swagger
 * /reports/admin/pending:
 *   get:
 *     summary: Get all pending reports (admin only)
 *     tags: [Reports & Blocks]
 *     responses:
 *       200:
 *         description: List of pending user reports
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/admin/pending", requireAuth, getAdminReports);

/**
 * @swagger
 * /reports/admin/{reportId}:
 *   put:
 *     summary: Update the status of a report (admin only)
 *     tags: [Reports & Blocks]
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [reviewed, dismissed, actioned]
 *     responses:
 *       200:
 *         description: Report updated
 */
router.put("/admin/:reportId", requireAuth, updateAdminReport);

export default router;