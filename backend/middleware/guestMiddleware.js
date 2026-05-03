import { v4 as uuidv4 } from "uuid";

/**
 * guestMiddleware
 * ═══════════════════════════════════════════════════════════════
 * PURPOSE: Assign a unique, persistent guestId to every visitor
 *          (whether logged in or not) so we can track anonymous
 *          carts across page refreshes without a server session.
 *
 * COOKIE DETAILS:
 *  Name     : guestId
 *  Location : req.cookies.guestId   (READ)
 *             res.cookie(...)        (WRITE — only when absent)
 *  Lifetime : 7 days (maxAge: 7 * 24 * 60 * 60 * 1000 ms)
 *  Flags    : httpOnly = true  → not accessible via document.cookie
 *             sameSite = "Lax" → sent on same-site navigations
 *             secure   = production only
 *
 * HOW IT WORKS:
 *  1. If the incoming request already has a guestId cookie → reuse it.
 *  2. Otherwise generate a new UUID, persist it as a cookie, and
 *     attach it to `req.guestId` for downstream route handlers.
 *
 * DIFFERENCE FROM HTTP SESSIONS:
 *  HTTP sessions (e.g. express-session) store state on the SERVER
 *  and use a session ID cookie only as a key.
 *  Here we use cookies purely for CLIENT-SIDE identification —
 *  the cart data itself lives in MongoDB, not in memory/session store.
 * ═══════════════════════════════════════════════════════════════
 */
export const assignGuestId = (req, res, next) => {
  // ── READ: Does a guestId cookie already exist? ───────────────
  let guestId = req.cookies?.guestId;

  if (!guestId) {
    // ── WRITE: First visit — generate and persist a new UUID ──
    guestId = uuidv4();

    res.cookie("guestId", guestId, {
      httpOnly: true,                          // not exposed to JS
      maxAge: 7 * 24 * 60 * 60 * 1000,        // 7 days in ms
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    });
    // ^ ↑ THIS IS WHERE THE GUEST COOKIE IS SET ↑ ^
  }

  // Attach to request so cart routes can use it without re-reading
  req.guestId = guestId;
  next();
};
