import Expense from "../models/Expense.js";
import Trip from "../models/Trip.js";
import { simplifyDebts, calculateUserBalance } from "../utils/debtSimplifier.js";

export const createExpense = async (req, res) => {
  try {
    const { tripId, description, amount, currency, paidBy, splitType, splits, category } = req.body;
    const userId = req.user;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Validate splits
    if (!splits || splits.length === 0) {
      return res.status(400).json({ message: "At least one split required" });
    }

    let totalSplit = 0;
    splits.forEach((split) => {
      totalSplit += split.amount;
    });

    // Allow small rounding differences
    if (Math.abs(totalSplit - amount) > 0.01) {
      return res.status(400).json({
        message: "Split amounts must equal total amount",
        totalSplit,
        amount
      });
    }

    const expense = await Expense.create({
      trip: tripId,
      description,
      amount,
      currency: currency || trip.currency,
      paidBy: paidBy || userId,
      splitType: splitType || "equal",
      splits,
      category: category || "other"
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate("paidBy", "name email")
      .populate("splits.user", "name email");

    return res.status(201).json({
      message: "Expense created successfully",
      expense: populatedExpense
    });
  } catch (err) {
    return res.status(500).json({ message: "Error creating expense", error: err.message });
  }
};

export const getTripExpenses = async (req, res) => {
  try {
    const { tripId } = req.params;

    const expenses = await Expense.find({ trip: tripId })
      .populate("paidBy", "name email")
      .populate("splits.user", "name email")
      .sort({ date: -1 });

    return res.json({ expenses });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching expenses", error: err.message });
  }
};

export const getDebtSummary = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user;

    const trip = await Trip.findById(tripId).populate("members.user", "name email");
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const expenses = await Expense.find({ trip: tripId });

    // Calculate simplified debts
    const debtSummary = simplifyDebts(expenses, trip.members);

    // Calculate individual balance for current user
    const userBalance = calculateUserBalance(userId, expenses);

    return res.json({
      summary: debtSummary,
      userBalance,
      totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0)
    });
  } catch (err) {
    return res.status(500).json({ message: "Error calculating debt summary", error: err.message });
  }
};

export const settleExpense = async (req, res) => {
  try {
    const { expenseId, userId } = req.body;

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const split = expense.splits.find(
      (s) => s.user.toString() === userId.toString()
    );

    if (!split) {
      return res.status(404).json({ message: "Split not found" });
    }

    split.settled = true;
    split.settledAt = new Date();
    await expense.save();

    return res.json({ message: "Expense settled successfully", expense });
  } catch (err) {
    return res.status(500).json({ message: "Error settling expense", error: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const userId = req.user;

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Check if user is the one who paid or is trip admin
    const trip = await Trip.findById(expense.trip);
    const isAdmin = trip.organizer.toString() === userId.toString();
    const isPayer = expense.paidBy.toString() === userId.toString();

    if (!isAdmin && !isPayer) {
      return res.status(403).json({ message: "Not authorized to delete this expense" });
    }

    await Expense.findByIdAndDelete(expenseId);

    return res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting expense", error: err.message });
  }
};

