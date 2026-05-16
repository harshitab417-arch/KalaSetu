import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { uploadLimiter } from "../middleware/rateLimitMiddleware.js";
import { validateImage, validatePdf } from "../middleware/imageValidationMiddleware.js";
import {
  getCreators,
  followUser,
  acceptFollow,
  rejectFollow,
  getFollowers,
  getFollowStatus,
  getFollowing,
  getProfile,
  upsertProfile,
} from "../controllers/profileController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Profiles
 *   description: Artisan profiles, follow system, and creator directory
 */

/**
 * @swagger
 * /profiles/creators:
 *   get:
 *     summary: Get list of all verified creators
 *     tags: [Profiles]
 *     security: []
 *     responses:
 *       200:
 *         description: Array of creator profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/creators", getCreators);

/**
 * @swagger
 * /profiles/{userId}/follow:
 *   put:
 *     summary: Send a follow request to a user
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Follow request sent
 *       400:
 *         description: Already following or invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:userId/follow", requireAuth, followUser);

/**
 * @swagger
 * /profiles/{userId}/accept-follow:
 *   put:
 *     summary: Accept a follow request from a user
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Follow request accepted
 */
router.put("/:userId/accept-follow", requireAuth, acceptFollow);

/**
 * @swagger
 * /profiles/{userId}/reject-follow:
 *   put:
 *     summary: Reject a follow request from a user
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Follow request rejected
 */
router.put("/:userId/reject-follow", requireAuth, rejectFollow);

/**
 * @swagger
 * /profiles/{userId}/followers:
 *   get:
 *     summary: Get the followers of a user
 *     tags: [Profiles]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of followers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/:userId/followers", getFollowers);

/**
 * @swagger
 * /profiles/{userId}/follow-status:
 *   get:
 *     summary: Check follow status between authenticated user and target user
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Follow status object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isFollowing:
 *                   type: boolean
 *                 isPending:
 *                   type: boolean
 */
router.get("/:userId/follow-status", requireAuth, getFollowStatus);

/**
 * @swagger
 * /profiles/{userId}/following:
 *   get:
 *     summary: Get list of users that a user is following
 *     tags: [Profiles]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users being followed
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/:userId/following", getFollowing);

/**
 * @swagger
 * /profiles/{userId}:
 *   get:
 *     summary: Get a user's public profile
 *     tags: [Profiles]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile data
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:userId", getProfile);

/**
 * @swagger
 * /profiles:
 *   post:
 *     summary: Create or update the authenticated user's profile
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 example: Madhubani artist from Bihar
 *               craft:
 *                 type: string
 *                 example: Madhubani Painting
 *               location:
 *                 type: string
 *                 example: Patna, Bihar
 *               photo:
 *                 type: string
 *                 description: Base64-encoded profile photo
 *               verificationDocument:
 *                 type: string
 *                 description: Base64-encoded PDF for creator verification
 *     responses:
 *       200:
 *         description: Profile created or updated
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", requireAuth, uploadLimiter, validateImage("photo"), validatePdf("verificationDocument"), upsertProfile);

export default router;
