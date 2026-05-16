import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { uploadLimiter } from "../middleware/rateLimitMiddleware.js";
import { validateImage } from "../middleware/imageValidationMiddleware.js";
import {
  getConversations,
  checkCanMessage,
  getMessages,
  sendMessage,
  deleteMessage,
  clearChat,
  deleteMessageForMe,
} from "../controllers/messageController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Direct messaging between users
 */

/**
 * @swagger
 * /messages/conversations:
 *   get:
 *     summary: Get all conversations for the authenticated user
 *     tags: [Messages]
 *     responses:
 *       200:
 *         description: List of conversations with latest message previews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   partner:
 *                     $ref: '#/components/schemas/User'
 *                   lastMessage:
 *                     $ref: '#/components/schemas/Message'
 *                   unreadCount:
 *                     type: integer
 */
router.get("/conversations", requireAuth, getConversations);

/**
 * @swagger
 * /messages/can-message/{userId}:
 *   get:
 *     summary: Check if the authenticated user can message a target user
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messaging permission result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 canMessage:
 *                   type: boolean
 */
router.get("/can-message/:userId", requireAuth, checkCanMessage);

/**
 * @swagger
 * /messages/{userId}:
 *   get:
 *     summary: Get full message thread with a specific user
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The other user's ID
 *     responses:
 *       200:
 *         description: Array of messages in the thread
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 */
router.get("/:userId", requireAuth, getMessages);

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Send a message to another user
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [receiverId]
 *             properties:
 *               receiverId:
 *                 type: string
 *               text:
 *                 type: string
 *                 example: Hello, I loved your work!
 *               image:
 *                 type: string
 *                 description: Base64-encoded image
 *     responses:
 *       201:
 *         description: Message sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       403:
 *         description: Cannot message this user (blocked or not following)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", requireAuth, uploadLimiter, validateImage("image"), sendMessage);

/**
 * @swagger
 * /messages/clear/{partnerId}:
 *   delete:
 *     summary: Clear entire chat history with a partner (for both sides)
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: partnerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat cleared
 */
router.delete("/clear/:partnerId", requireAuth, clearChat);

/**
 * @swagger
 * /messages/{messageId}/for-me:
 *   delete:
 *     summary: Delete a message only for the authenticated user (soft delete)
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message hidden for current user
 */
router.delete("/:messageId/for-me", requireAuth, deleteMessageForMe);

/**
 * @swagger
 * /messages/{messageId}:
 *   delete:
 *     summary: Delete a message for everyone
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted for all parties
 *       403:
 *         description: Not the sender
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:messageId", requireAuth, deleteMessage);

export default router;