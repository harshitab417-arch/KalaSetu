import express from "express";
import { requireAuth, optionalAuth, requireRole } from "../middleware/authMiddleware.js";
import { uploadLimiter } from "../middleware/rateLimitMiddleware.js";
import { validateImage } from "../middleware/imageValidationMiddleware.js";
import {
  getPosts,
  getPostById,
  getPostLikers,
  getPostDislikers,
  createPost,
  deletePost,
  likePost,
  dislikePost,
  repostPost,
  addComment,
  getComments,
  deleteComment,
  editPost,
} from "../controllers/postController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Artisan posts — create, read, like, comment, repost
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts (feed)
 *     tags: [Posts]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [event, artwork, story, workshop, announcement]
 *         description: Filter posts by category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
router.get("/", optionalAuth, getPosts);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a single post by ID
 *     tags: [Posts]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", optionalAuth, getPostById);

/**
 * @swagger
 * /posts/{id}/likes:
 *   get:
 *     summary: Get list of users who liked a post
 *     tags: [Posts]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of users who liked the post
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/:id/likes", getPostLikers);

/**
 * @swagger
 * /posts/{id}/dislikes:
 *   get:
 *     summary: Get list of users who disliked a post
 *     tags: [Posts]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of users who disliked the post
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/:id/dislikes", getPostDislikers);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post (creator role required)
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *                 example: My Madhubani Collection
 *               content:
 *                 type: string
 *                 example: Sharing my latest set of paintings...
 *               category:
 *                 type: string
 *                 enum: [event, artwork, story, workshop, announcement]
 *                 example: artwork
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [madhubani, folk-art]
 *               image:
 *                 type: string
 *                 description: Base64-encoded image string
 *     responses:
 *       201:
 *         description: Post created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       403:
 *         description: Forbidden — creator role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", requireAuth, requireRole, uploadLimiter, validateImage("image"), createPost);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post (author only)
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted
 *       403:
 *         description: Forbidden — not the author
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", requireAuth, deletePost);

/**
 * @swagger
 * /posts/{id}/like:
 *   put:
 *     summary: Like or unlike a post (toggles)
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like toggled
 */
router.put("/:id/like", requireAuth, likePost);

/**
 * @swagger
 * /posts/{id}/dislike:
 *   put:
 *     summary: Dislike or un-dislike a post (toggles)
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dislike toggled
 */
router.put("/:id/dislike", requireAuth, dislikePost);

/**
 * @swagger
 * /posts/{id}/repost:
 *   put:
 *     summary: Repost or un-repost a post (toggles)
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Repost toggled
 */
router.put("/:id/repost", requireAuth, repostPost);

/**
 * @swagger
 * /posts/{id}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 example: Stunning work!
 *     responses:
 *       201:
 *         description: Comment added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 */
router.post("/:id/comments", requireAuth, addComment);

/**
 * @swagger
 * /posts/{id}/comments:
 *   get:
 *     summary: Get all comments for a post
 *     tags: [Posts]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 */
router.get("/:id/comments", getComments);

/**
 * @swagger
 * /posts/{id}/comments/{commentId}:
 *   delete:
 *     summary: Delete a specific comment
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id/comments/:commentId", requireAuth, deleteComment);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Edit an existing post (author only)
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
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
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 */
router.put("/:id", requireAuth, uploadLimiter, validateImage("image"), editPost);

export default router;