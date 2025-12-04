const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  transactions: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    currency: String,
    status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending' },
    paidAt: Date
  }],
  totalExpense: Number,
  perPersonShare: Number,
  balances: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    balance: Number,
    settled: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settlement', settlementSchema);
