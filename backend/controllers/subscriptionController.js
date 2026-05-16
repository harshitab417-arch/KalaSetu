import { Cart } from "../models/Cart.js";
import { Transaction } from "../models/Transaction.js";

const PLANS = [
  { planId: "artisan", name: "Artisan Plan", price: 99, description: "Perfect for independent artisans starting their journey.", features: ["Create up to 10 posts/month", "Basic profile badge", "Community access"], color: "#a78bfa" },
  { planId: "patron", name: "Patron Pro", price: 199, description: "For dedicated patrons who want to support the arts deeply.", features: ["Unlimited posts", "Verified Patron badge", "Priority search ranking", "Direct messaging"], color: "#f59e0b" },
  { planId: "ngo", name: "NGO Sustainer", price: 499, description: "Empower your NGO with full platform capabilities.", features: ["Unlimited everything", "NGO dashboard", "Bulk member management", "Analytics & insights", "Dedicated support"], color: "#34d399" },
];

export const resolveOwner = (req) => {
  if (req.user?.id) return { owner: String(req.user.id), ownerType: "user" };
  return { owner: req.guestId, ownerType: "guest" };
};

// ── GET /subscription/plans ───────────────────────────────────────────
export const getPlans = (req, res) => {
  if (!req.session.plansViewCount) {
    req.session.plansViewCount = 1;
    req.session.subscriptionSessionStart = new Date().toLocaleString();
  } else {
    req.session.plansViewCount++;
  }
  res.cookie("user_preference_demo", "dark_mode", { maxAge: 3600000, httpOnly: false });
  res.json({
    plans: PLANS,
    trackingDemo: {
      session: { viewCount: req.session.plansViewCount, startTime: req.session.subscriptionSessionStart, type: "Server-side Session" },
      cookie: { value: "dark_mode", type: "Client-side Cookie" },
    },
  });
};

// ── POST /subscription/cart/add ───────────────────────────────────────
export const addToCart = async (req, res, next) => {
  try {
    const { planId } = req.body;
    const plan = PLANS.find((p) => p.planId === planId);
    if (!plan) return res.status(400).json({ message: "Invalid plan ID" });
    const { owner, ownerType } = resolveOwner(req);
    let cart = await Cart.findOne({ owner });
    if (!cart) cart = new Cart({ owner, ownerType, items: [] });
    if (cart.items.some((i) => i.planId === planId)) return res.status(409).json({ message: "Plan already in cart" });
    cart.items.push({ planId: plan.planId, name: plan.name, price: plan.price });
    await cart.save();
    res.status(201).json({ message: "Plan added to cart", cart: { owner, ownerType, items: cart.items } });
  } catch (err) { next(err); }
};

// ── GET /subscription/cart ────────────────────────────────────────────
export const getCart = async (req, res, next) => {
  try {
    const { owner } = resolveOwner(req);
    const cart = await Cart.findOne({ owner });
    const items = cart ? cart.items : [];
    const total = items.reduce((sum, i) => sum + i.price, 0);
    res.json({ items, total });
  } catch (err) { next(err); }
};

// ── DELETE /subscription/cart/:planId ─────────────────────────────────
export const removeFromCart = async (req, res, next) => {
  try {
    const { owner } = resolveOwner(req);
    const cart = await Cart.findOne({ owner });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = cart.items.filter((i) => i.planId !== req.params.planId);
    await cart.save();
    res.json({ message: "Item removed", items: cart.items });
  } catch (err) { next(err); }
};

// ── POST /subscription/cart/merge ─────────────────────────────────────
export const mergeCart = async (req, res, next) => {
  try {
    const guestId = req.cookies?.guestId || req.body?.guestId;
    const userId = String(req.user.id);
    if (!guestId) return res.json({ message: "No guest cart to merge", merged: 0 });
    const guestCart = await Cart.findOne({ owner: guestId, ownerType: "guest" });
    if (!guestCart || guestCart.items.length === 0) {
      res.clearCookie("guestId");
      return res.json({ message: "Guest cart was empty", merged: 0 });
    }
    let userCart = await Cart.findOne({ owner: userId, ownerType: "user" });
    if (!userCart) userCart = new Cart({ owner: userId, ownerType: "user", items: [] });
    let mergedCount = 0;
    for (const guestItem of guestCart.items) {
      if (!userCart.items.some((i) => i.planId === guestItem.planId)) { userCart.items.push(guestItem); mergedCount++; }
    }
    await userCart.save();
    await Cart.deleteOne({ owner: guestId });
    res.clearCookie("guestId");
    res.json({ message: `Cart merged successfully. ${mergedCount} plan(s) transferred.`, merged: mergedCount, items: userCart.items });
  } catch (err) { next(err); }
};

// ── POST /subscription/checkout ───────────────────────────────────────
export const checkout = async (req, res, next) => {
  try {
    const userId = String(req.user.id);
    const cart = await Cart.findOne({ owner: userId, ownerType: "user" });
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Your cart is empty" });
    const total = cart.items.reduce((sum, i) => sum + i.price, 0);
    const paymentStatus = "SUCCESS";
    const transaction = await Transaction.create({ userId, items: cart.items, total, status: paymentStatus });
    await Cart.deleteOne({ owner: userId });
    res.status(201).json({ message: "Checkout successful! Thank you for supporting KalaSetu.", transactionId: transaction._id, total, status: paymentStatus, items: transaction.items, timestamp: transaction.createdAt });
  } catch (err) { next(err); }
};

// ── GET /subscription/transactions ───────────────────────────────────
export const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json({ transactions });
  } catch (err) { next(err); }
};
