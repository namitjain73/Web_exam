import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true
    },
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: "USD"
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    splitType: {
      type: String,
      enum: ["equal", "unequal", "percentage"],
      default: "equal"
    },
    splits: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        amount: {
          type: Number,
          required: true
        },
        percentage: {
          type: Number,
          default: 0
        },
        settled: {
          type: Boolean,
          default: false
        },
        settledAt: Date
      }
    ],
    category: {
      type: String,
      default: "other"
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);

