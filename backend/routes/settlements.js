const express = require('express');
const Settlement = require('../models/Settlement');
const Expense = require('../models/Expense');
const Trip = require('../models/Trip');
const authMiddleware = require('../middleware/auth');
const DebtSimplifier = require('../utils/DebtSimplifier');

const router = express.Router();

// Get Settlement for Trip
router.get('/trip/:tripId', authMiddleware, async (req, res) => {
  try {
    let settlement = await Settlement.findOne({ trip: req.params.tripId })
      .populate('balances.userId', 'name email')
      .populate('transactions.from', 'name email')
      .populate('transactions.to', 'name email');

    if (!settlement) {
      const trip = await Trip.findById(req.params.tripId).populate('members.userId');
      const expenses = await Expense.find({ trip: req.params.tripId })
        .populate('paidBy')
        .populate('splitBetween.userId');

      const simplification = DebtSimplifier.simplifyDebts(expenses, trip.members);
      const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

      const balances = trip.members.map(member => ({
        userId: member.userId._id,
        balance: simplification.balances[member.userId._id.toString()] || 0,
        settled: false
      }));

      settlement = new Settlement({
        trip: req.params.tripId,
        transactions: simplification.transactions.map(t => ({
          from: t.from,
          to: t.to,
          amount: t.amount,
          currency: 'USD',
          status: 'pending'
        })),
        totalExpense,
        perPersonShare: totalExpense / trip.members.length,
        balances
      });

      await settlement.save();
      await settlement.populate('balances.userId', 'name email');
      await settlement.populate('transactions.from', 'name email');
      await settlement.populate('transactions.to', 'name email');
    }

    res.json(settlement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark Transaction as Completed
router.put('/:settlementId/transaction/:transactionIndex', authMiddleware, async (req, res) => {
  try {
    const settlement = await Settlement.findById(req.params.settlementId);
    if (!settlement) return res.status(404).json({ error: 'Settlement not found' });

    const transaction = settlement.transactions[req.params.transactionIndex];
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    // Check if user is either sender or receiver
    if (transaction.from.toString() !== req.user.userId && 
        transaction.to.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    transaction.status = 'completed';
    transaction.paidAt = Date.now();

    await settlement.save();
    await settlement.populate('transactions.from', 'name email');
    await settlement.populate('transactions.to', 'name email');

    res.json(settlement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recalculate Settlement (when new expenses added)
router.post('/:settlementId/recalculate', authMiddleware, async (req, res) => {
  try {
    const settlement = await Settlement.findById(req.params.settlementId);
    if (!settlement) return res.status(404).json({ error: 'Settlement not found' });

    const trip = await Trip.findById(settlement.trip).populate('members.userId');
    const expenses = await Expense.find({ trip: settlement.trip })
      .populate('paidBy')
      .populate('splitBetween.userId');

    const simplification = DebtSimplifier.simplifyDebts(expenses, trip.members);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    settlement.transactions = simplification.transactions.map(t => ({
      from: t.from,
      to: t.to,
      amount: t.amount,
      currency: 'USD',
      status: 'pending'
    }));

    settlement.totalExpense = totalExpense;
    settlement.perPersonShare = totalExpense / trip.members.length;
    settlement.balances = trip.members.map(member => ({
      userId: member.userId._id,
      balance: simplification.balances[member.userId._id.toString()] || 0,
      settled: false
    }));

    await settlement.save();
    await settlement.populate('transactions.from', 'name email');
    await settlement.populate('transactions.to', 'name email');

    res.json(settlement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
