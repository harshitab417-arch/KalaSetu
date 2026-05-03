import mongoose from "mongoose";

/**
 * Cart Model
 * -----------------------------------------------------------------
 * COOKIE / SESSION TRACKING NOTE:
 *  - For GUEST users  → owner = guestId string (from cookie)
 *  - For LOGGED-IN users → owner = userId string (MongoDB ObjectId as string)
 * The `ownerType` field makes it easy to distinguish between the two
 * and is critical for the guest→user merge step.
 * -----------------------------------------------------------------
 */
const cartItemSchema = new mongoose.Schema(
  {
    planId: { type: String, required: true },
    name:   { type: String, required: true },
    price:  { type: Number, required: true },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    // owner is EITHER a guestId (UUID string) OR a userId (ObjectId as string)
    owner: { type: String, required: true, unique: true, index: true },
    ownerType: {
      type: String,
      enum: ["guest", "user"],
      required: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

export const Cart = mongoose.model("Cart", cartSchema);
