const express = require('express');
const Expense = require('../models/Expense');
const Trip = require('../models/Trip');
const authMiddleware = require('../middleware/auth');
const DebtSimplifier = require('../utils/DebtSimplifier');

const router = express.Router();

// Add Expense
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tripId, description, amount, currency, splitBetween, category, date } = req.body;

    const expense = new Expense({
      trip: tripId,
      description,
      amount,
      currency,
      paidBy: req.user.userId,
      splitBetween,
      category,
      date: date || Date.now()
    });

    await expense.save();
    await expense.populate('paidBy', 'name email');
    await expense.populate('splitBetween.userId', 'name email');

    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Trip Expenses
router.get('/trip/:tripId', authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ trip: req.params.tripId })
      .populate('paidBy', 'name email')
      .populate('splitBetween.userId', 'name email')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Expense
router.put('/:expenseId', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.expenseId);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    if (expense.paidBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(expense, req.body);
    expense.updatedAt = Date.now();
    await expense.save();
    await expense.populate('paidBy', 'name email');
    await expense.populate('splitBetween.userId', 'name email');

    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Expense
router.delete('/:expenseId', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.expenseId);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    if (expense.paidBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Expense.findByIdAndDelete(req.params.expenseId);
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Trip Summary with Debt Simplification
router.get('/summary/:tripId', authMiddleware, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId).populate('members.userId');
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const expenses = await Expense.find({ trip: req.params.tripId })
      .populate('paidBy')
      .populate('splitBetween.userId');

    const simplification = DebtSimplifier.simplifyDebts(expenses, trip.members);

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const perPersonShare = totalExpense / trip.members.length;

    res.json({
      totalExpense,
      perPersonShare,
      expenseCount: expenses.length,
      members: trip.members.length,
      simplification,
      expenses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
