import mongoose from "mongoose";

/**
 * Transaction Model
 * -----------------------------------------------------------------
 * Records every checkout attempt for a logged-in user.
 * Linked to the User by userId (ObjectId).
 * -----------------------------------------------------------------
 */
const transactionItemSchema = new mongoose.Schema(
  {
    planId: { type: String, required: true },
    name:   { type: String, required: true },
    price:  { type: Number, required: true },
  },
  { _id: false }
);

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items:  { type: [transactionItemSchema], required: true },
    total:  { type: Number, required: true },
    // SUCCESS or FAILED — simulated, no real payment gateway
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
    },
  },
  { timestamps: true }  // createdAt doubles as "purchase timestamp"
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
