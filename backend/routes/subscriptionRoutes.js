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

router.get("/plans", getPlans);

router.post("/cart/add", assignGuestId, optionalAuth, addToCart);

router.get("/cart", assignGuestId, optionalAuth, getCart);

router.delete("/cart/:planId", assignGuestId, optionalAuth, removeFromCart);

router.post("/cart/merge", requireAuth, mergeCart);

router.post("/checkout", requireAuth, checkout);

router.get("/transactions", requireAuth, getTransactions);

export default router;
