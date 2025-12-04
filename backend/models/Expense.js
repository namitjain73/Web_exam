const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  splitBetween: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    share: { type: Number, required: true }, // Percentage or fixed amount
    shareType: { type: String, enum: ['equal', 'percentage', 'exact'], default: 'equal' }
  }],
  date: { type: Date, default: Date.now },
  category: { type: String, enum: ['accommodation', 'food', 'transport', 'activities', 'other'], default: 'other' },
  attachments: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);
