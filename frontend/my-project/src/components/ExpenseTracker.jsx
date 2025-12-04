import React, { useState, useEffect } from 'react';
import { expenseAPI, getSocket } from '../services/api';
import '../styles/ExpenseTracker.css';

const ExpenseTracker = ({ tripId, trip }) => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'other',
    splitBetween: trip.members.map(m => ({ userId: m.userId._id || m.userId, share: 100 / trip.members.length, shareType: 'equal' }))
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
    const socket = getSocket();
    if (socket) {
      socket.on('expense-updated', loadExpenses);
    }
    return () => {
      if (socket) socket.off('expense-updated', loadExpenses);
    };
  }, [tripId]);

  const loadExpenses = async () => {
    try {
      const [expensesRes, summaryRes] = await Promise.all([
        expenseAPI.getExpenses(tripId),
        expenseAPI.getSummary(tripId)
      ]);
      setExpenses(expensesRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const newExpense = {
        tripId,
        ...formData,
        amount: parseFloat(formData.amount)
      };
      await expenseAPI.addExpense(newExpense);
      setFormData({
        description: '',
        amount: '',
        category: 'other',
        splitBetween: trip.members.map(m => ({ userId: m.userId._id || m.userId, share: 100 / trip.members.length, shareType: 'equal' }))
      });
      setShowForm(false);
      loadExpenses();
    } catch (err) {
      console.error('Failed to add expense');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await expenseAPI.deleteExpense(expenseId);
      loadExpenses();
    } catch (err) {
      console.error('Failed to delete expense');
    }
  };

  if (loading) return <div className="loading">Loading expenses...</div>;

  return (
    <div className="expense-tracker">
      <div className="tracker-header">
        <h2>Expenses</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Expense'}
        </button>
      </div>

      {summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Spent</h3>
            <p className="amount">${summary.totalExpense.toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h3>Per Person Share</h3>
            <p className="amount">${summary.perPersonShare.toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h3>Expenses Count</h3>
            <p className="amount">{summary.expenseCount}</p>
          </div>
        </div>
      )}

      {showForm && (
        <form className="expense-form" onSubmit={handleAddExpense}>
          <div className="form-row">
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Dinner at Cafe"
                required
              />
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option value="accommodation">Accommodation</option>
                <option value="food">Food</option>
                <option value="transport">Transport</option>
                <option value="activities">Activities</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Split Between</label>
            <div className="split-options">
              {trip.members.map((member) => (
                <label key={member._id} className="split-member">
                  <input type="checkbox" defaultChecked />
                  <span>{member.userId?.name || 'Unknown'}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary">Add Expense</button>
        </form>
      )}

      <div className="expenses-list">
        {expenses.length === 0 ? (
          <p className="empty-message">No expenses yet</p>
        ) : (
          expenses.map((expense) => (
            <div key={expense._id} className={`expense-item category-${expense.category}`}>
              <div className="expense-info">
                <h4>{expense.description}</h4>
                <p className="expense-details">
                  Paid by <strong>{expense.paidBy?.name}</strong> on {new Date(expense.date).toLocaleDateString()}
                </p>
              </div>
              <div className="expense-amount">
                <p className="amount">${expense.amount.toFixed(2)}</p>
                <span className="category-badge">{expense.category}</span>
              </div>
              <button 
                className="btn-delete"
                onClick={() => handleDeleteExpense(expense._id)}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;
