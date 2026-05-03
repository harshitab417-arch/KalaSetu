import express from "express";
import { Cart } from "../models/Cart.js";
import { Transaction } from "../models/Transaction.js";
import { assignGuestId } from "../middleware/guestMiddleware.js";
import { optionalAuth, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────
// SUBSCRIPTION PLANS (hardcoded — no DB needed for plan catalogue)
// ─────────────────────────────────────────────────────────────────
const PLANS = [
  {
    planId: "artisan",
    name: "Artisan Plan",
    price: 99,
    description: "Perfect for independent artisans starting their journey.",
    features: ["Create up to 10 posts/month", "Basic profile badge", "Community access"],
    color: "#a78bfa",
  },
  {
    planId: "patron",
    name: "Patron Pro",
    price: 199,
    description: "For dedicated patrons who want to support the arts deeply.",
    features: ["Unlimited posts", "Verified Patron badge", "Priority search ranking", "Direct messaging"],
    color: "#f59e0b",
  },
  {
    planId: "ngo",
    name: "NGO Sustainer",
    price: 499,
    description: "Empower your NGO with full platform capabilities.",
    features: ["Unlimited everything", "NGO dashboard", "Bulk member management", "Analytics & insights", "Dedicated support"],
    color: "#34d399",
  },
];

// ─────────────────────────────────────────────────────────────────
// HELPER: resolve owner key from request
// ─────────────────────────────────────────────────────────────────
const resolveOwner = (req) => {
  if (req.user?.id) {
    // Authenticated user — cart keyed by MongoDB userId
    return { owner: String(req.user.id), ownerType: "user" };
  }
  // Guest user — cart keyed by guestId cookie (set by assignGuestId middleware)
  return { owner: req.guestId, ownerType: "guest" };
};

// ══════════════════════════════════════════════════════════════════
// ROUTE 1 — GET /subscription/plans
// Public endpoint — returns the available subscription plan catalogue
// ══════════════════════════════════════════════════════════════════
router.get("/plans", (req, res) => {
  // ── Demo: HTTP Session tracking for academic purpose ───────────────
  // This logic demonstrates how the server can store data about a user
  // across requests without storing it in the browser's cookies.
  if (!req.session.plansViewCount) {
    req.session.plansViewCount = 1;
    req.session.subscriptionSessionStart = new Date().toLocaleString();
  } else {
    req.session.plansViewCount++;
  }

  // ── Demo: Client-side Cookie tracking for academic purpose ─────────
  // This sets a plain cookie that the browser stores directly.
  res.cookie("user_preference_demo", "dark_mode", {
    maxAge: 3600000, // 1 hour
    httpOnly: false, // Set to false so it's "visible" in the browser DevTools
  });

  // Return plans + the lightweight tracking data for the UI to display
  res.json({ 
    plans: PLANS,
    trackingDemo: {
      session: {
        viewCount: req.session.plansViewCount,
        startTime: req.session.subscriptionSessionStart,
        type: "Server-side Session"
      },
      cookie: {
        value: "dark_mode",
        type: "Client-side Cookie"
      }
    }
  });
});

// ══════════════════════════════════════════════════════════════════
// ROUTE 2 — POST /subscription/cart/add
// Works for guests AND logged-in users.
// Cookie flow:
//   assignGuestId runs → req.guestId is set (new or existing cookie)
//   optionalAuth runs  → req.user set if valid JWT present
//   resolveOwner picks whichever identifier is available
// ══════════════════════════════════════════════════════════════════
router.post("/cart/add", assignGuestId, optionalAuth, async (req, res, next) => {
  try {
    const { planId } = req.body;

    const plan = PLANS.find((p) => p.planId === planId);
    if (!plan) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    const { owner, ownerType } = resolveOwner(req);

    // Upsert: find the cart for this owner or create one
    let cart = await Cart.findOne({ owner });
    if (!cart) {
      cart = new Cart({ owner, ownerType, items: [] });
    }

    // Prevent duplicate plan in same cart
    const alreadyInCart = cart.items.some((i) => i.planId === planId);
    if (alreadyInCart) {
      return res.status(409).json({ message: "Plan already in cart" });
    }

    cart.items.push({ planId: plan.planId, name: plan.name, price: plan.price });
    await cart.save();

    res.status(201).json({
      message: "Plan added to cart",
      cart: { owner, ownerType, items: cart.items },
    });
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// ROUTE 3 — GET /subscription/cart
// Returns the cart for the current user or guest
// ══════════════════════════════════════════════════════════════════
router.get("/cart", assignGuestId, optionalAuth, async (req, res, next) => {
  try {
    const { owner } = resolveOwner(req);
    const cart = await Cart.findOne({ owner });
    const items = cart ? cart.items : [];
    const total = items.reduce((sum, i) => sum + i.price, 0);

    res.json({ items, total });
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// ROUTE 4 — DELETE /subscription/cart/:planId
// Remove a specific plan from the cart
// ══════════════════════════════════════════════════════════════════
router.delete("/cart/:planId", assignGuestId, optionalAuth, async (req, res, next) => {
  try {
    const { owner } = resolveOwner(req);
    const cart = await Cart.findOne({ owner });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((i) => i.planId !== req.params.planId);
    await cart.save();

    res.json({ message: "Item removed", items: cart.items });
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// ROUTE 5 — POST /subscription/cart/merge     ← GUEST → USER MERGE
// ─────────────────────────────────────────────────────────────────
// Called IMMEDIATELY AFTER LOGIN by the frontend (SignIn.jsx).
// Steps:
//  1. Find the guest cart by guestId (sent in request body)
//  2. Find or create the user's cart
//  3. Copy items from guest cart → user cart (no duplicates)
//  4. Delete the guest cart
//  5. Clear the guestId cookie (guest session ends)
//
// WHY THIS MATTERS:
//  Without this step, the cart assembled before login would disappear
//  once the user logs in and the site starts using userId instead of
//  guestId. This merge ensures zero data loss.
// ══════════════════════════════════════════════════════════════════
router.post("/cart/merge", requireAuth, async (req, res, next) => {
  try {
    // ── READ GUEST ID ────────────────────────────────────────────
    // Since guestId is httpOnly, JS cannot read it via document.cookie.
    // We read it from req.cookies (parsed by cookie-parser in server.js).
    // req.body.guestId is a fallback for non-browser/test clients.
    const guestId = req.cookies?.guestId || req.body?.guestId;
    const userId = String(req.user.id);

    if (!guestId) {
      // No guest session to merge — nothing to do
      return res.json({ message: "No guest cart to merge", merged: 0 });
    }

    // ── STEP 1: Find guest cart ──────────────────────────────────
    const guestCart = await Cart.findOne({ owner: guestId, ownerType: "guest" });
    if (!guestCart || guestCart.items.length === 0) {
      // Guest had no cart — clean up cookie and continue
      res.clearCookie("guestId");
      return res.json({ message: "Guest cart was empty", merged: 0 });
    }

    // ── STEP 2: Find or create user cart ───────────────────────
    let userCart = await Cart.findOne({ owner: userId, ownerType: "user" });
    if (!userCart) {
      userCart = new Cart({ owner: userId, ownerType: "user", items: [] });
    }

    // ── STEP 3: Merge — skip items already in user cart ────────
    let mergedCount = 0;
    for (const guestItem of guestCart.items) {
      const exists = userCart.items.some((i) => i.planId === guestItem.planId);
      if (!exists) {
        userCart.items.push(guestItem);
        mergedCount++;
      }
    }
    await userCart.save();

    // ── STEP 4: Delete the now-consumed guest cart ──────────────
    await Cart.deleteOne({ owner: guestId });

    // ── STEP 5: Clear guestId cookie — session transferred ──────
    res.clearCookie("guestId");
    // ^ ↑ THIS IS THE GUEST → USER TRANSITION POINT ↑ ^

    res.json({
      message: `Cart merged successfully. ${mergedCount} plan(s) transferred.`,
      merged: mergedCount,
      items: userCart.items,
    });
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// ROUTE 6 — POST /subscription/checkout
// Requires authentication. Simulates a payment (always succeeds).
// Creates a Transaction record and clears the user's cart.
// ══════════════════════════════════════════════════════════════════
router.post("/checkout", requireAuth, async (req, res, next) => {
  try {
    const userId = String(req.user.id);

    const cart = await Cart.findOne({ owner: userId, ownerType: "user" });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const total = cart.items.reduce((sum, i) => sum + i.price, 0);

    // ── Simulate payment (always SUCCESS for demo) ──────────────
    const paymentStatus = "SUCCESS"; // In real life: call payment gateway here

    // ── Record in Transaction collection ───────────────────────
    const transaction = await Transaction.create({
      userId,
      items: cart.items,
      total,
      status: paymentStatus,
    });

    // ── Clear the cart post-purchase ───────────────────────────
    await Cart.deleteOne({ owner: userId });

    res.status(201).json({
      message: "Checkout successful! Thank you for supporting KalaSetu.",
      transactionId: transaction._id,
      total,
      status: paymentStatus,
      items: transaction.items,
      timestamp: transaction.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// ROUTE 7 — GET /subscription/transactions
// Returns full transaction history for the logged-in user,
// sorted newest first.
// ══════════════════════════════════════════════════════════════════
router.get("/transactions", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ transactions });
  } catch (err) {
    next(err);
  }
});

export default router;
