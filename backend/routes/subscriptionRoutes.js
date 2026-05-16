import express from "express";
import { assignGuestId } from "../middleware/guestMiddleware.js";
import { optionalAuth, requireAuth } from "../middleware/authMiddleware.js";
import {
  getPlans,
  addToCart,
  getCart,
  removeFromCart,
  mergeCart,
  checkout,
  getTransactions,
} from "../controllers/subscriptionController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Subscription plans, cart management, and checkout
 */

/**
 * @swagger
 * /subscription/plans:
 *   get:
 *     summary: Get all available subscription plans
 *     tags: [Subscriptions]
 *     security: []
 *     responses:
 *       200:
 *         description: List of subscription plans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                     example: Creator Pro
 *                   price:
 *                     type: number
 *                     example: 499
 *                   duration:
 *                     type: string
 *                     example: monthly
 *                   features:
 *                     type: array
 *                     items:
 *                       type: string
 */
router.get("/plans", getPlans);

/**
 * @swagger
 * /subscription/cart/add:
 *   post:
 *     summary: Add a plan to the cart (guest or authenticated)
 *     tags: [Subscriptions]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [planId]
 *             properties:
 *               planId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Plan added to cart
 *       404:
 *         description: Plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/cart/add", assignGuestId, optionalAuth, addToCart);

/**
 * @swagger
 * /subscription/cart:
 *   get:
 *     summary: Get the current cart (guest or authenticated)
 *     tags: [Subscriptions]
 *     security: []
 *     responses:
 *       200:
 *         description: Cart contents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/cart", assignGuestId, optionalAuth, getCart);

/**
 * @swagger
 * /subscription/cart/{planId}:
 *   delete:
 *     summary: Remove a plan from the cart
 *     tags: [Subscriptions]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan removed from cart
 */
router.delete("/cart/:planId", assignGuestId, optionalAuth, removeFromCart);

/**
 * @swagger
 * /subscription/cart/merge:
 *   post:
 *     summary: Merge guest cart into authenticated user's cart after login
 *     tags: [Subscriptions]
 *     responses:
 *       200:
 *         description: Cart merged successfully
 */
router.post("/cart/merge", requireAuth, mergeCart);

/**
 * @swagger
 * /subscription/checkout:
 *   post:
 *     summary: Checkout and process the subscription purchase
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 example: upi
 *     responses:
 *       200:
 *         description: Checkout successful, transaction created
 *       400:
 *         description: Empty cart or payment failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/checkout", requireAuth, checkout);

/**
 * @swagger
 * /subscription/transactions:
 *   get:
 *     summary: Get all subscription transactions for the authenticated user
 *     tags: [Subscriptions]
 *     responses:
 *       200:
 *         description: List of past transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   plan:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   status:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get("/transactions", requireAuth, getTransactions);

export default router;
