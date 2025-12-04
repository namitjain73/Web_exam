import { useState, useEffect } from "react";
import api from "../utils/api";
import { FiPlus, FiDollarSign, FiUsers } from "react-icons/fi";
import currencyConverter from "../utils/currency";
import "./ExpensesTab.css";

const ExpensesTab = ({ trip, onUpdate }) => {
  const [expenses, setExpenses] = useState([]);
  const [debtSummary, setDebtSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    currency: trip.currency || "USD",
    paidBy: "",
    splitType: "equal",
    splits: [],
    category: "other"
  });

  useEffect(() => {
    fetchExpenses();
    fetchDebtSummary();
  }, [trip._id]);

  const fetchExpenses = async () => {
    try {
      const response = await api.get(`/expenses/trip/${trip._id}`);
      setExpenses(response.data.expenses);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  const fetchDebtSummary = async () => {
    try {
      const response = await api.get(`/expenses/trip/${trip._id}/summary`);
      setDebtSummary(response.data);
    } catch (err) {
      console.error("Error fetching debt summary:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const amount = parseFloat(formData.amount);
      const splits = formData.splits.map((s) => ({
        user: s.user,
        amount: parseFloat(s.amount)
      }));

      await api.post("/expenses", {
        tripId: trip._id,
        description: formData.description,
        amount,
        currency: formData.currency,
        paidBy: formData.paidBy,
        splitType: formData.splitType,
        splits,
        category: formData.category
      });

      setShowForm(false);
      setFormData({
        description: "",
        amount: "",
        currency: trip.currency || "USD",
        paidBy: "",
        splitType: "equal",
        splits: [],
        category: "other"
      });
      fetchExpenses();
      fetchDebtSummary();
      onUpdate();
    } catch (err) {
      console.error("Error creating expense:", err);
      alert(err.response?.data?.message || "Error creating expense");
    }
  };

  const handleSplitChange = (memberId, amount) => {
    const existingIndex = formData.splits.findIndex((s) => s.user === memberId);
    const newSplits = [...formData.splits];

    if (existingIndex >= 0) {
      newSplits[existingIndex].amount = amount;
    } else {
      newSplits.push({ user: memberId, amount: parseFloat(amount) || 0 });
    }

    setFormData({ ...formData, splits: newSplits });
  };

  const calculateEqualSplit = () => {
    const amount = parseFloat(formData.amount) || 0;
    const memberCount = trip.members.length;
    const splitAmount = (amount / memberCount).toFixed(2);

    const splits = trip.members.map((member) => ({
      user: member.user._id,
      amount: parseFloat(splitAmount)
    }));

    setFormData({ ...formData, splits });
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="expenses-tab">
      <div className="expenses-header">
        <div>
          <h2>Expenses</h2>
          <p className="total-expenses">
            Total: {currencyConverter.format(totalExpenses, trip.currency)}
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <FiPlus /> Add Expense
        </button>
      </div>

      {debtSummary && (
        <div className="debt-summary">
          <h3>Debt Summary</h3>
          {debtSummary.summary.transactions.length === 0 ? (
            <p className="no-debts">All settled up! 🎉</p>
          ) : (
            <div className="transactions">
              {debtSummary.summary.transactions.map((transaction, idx) => {
                const fromUser = trip.members.find(
                  (m) => m.user._id === transaction.from
                )?.user;
                const toUser = trip.members.find(
                  (m) => m.user._id === transaction.to
                )?.user;

                return (
                  <div key={idx} className="transaction">
                    <span className="transaction-from">{fromUser?.name}</span>
                    <span className="transaction-arrow">→</span>
                    <span className="transaction-to">{toUser?.name}</span>
                    <span className="transaction-amount">
                      {currencyConverter.format(transaction.amount, trip.currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          {debtSummary.userBalance && (
            <div className="user-balance">
              <h4>Your Balance</h4>
              <p>
                {debtSummary.userBalance.status === "owed"
                  ? `You are owed ${currencyConverter.format(
                      debtSummary.userBalance.net,
                      trip.currency
                    )}`
                  : `You owe ${currencyConverter.format(
                      Math.abs(debtSummary.userBalance.net),
                      trip.currency
                    )}`}
              </p>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Expense</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Paid By</label>
                <select
                  value={formData.paidBy}
                  onChange={(e) =>
                    setFormData({ ...formData, paidBy: e.target.value })
                  }
                  required
                >
                  <option value="">Select member</option>
                  {trip.members.map((member) => (
                    <option key={member.user._id} value={member.user._id}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Split Type</label>
                <select
                  value={formData.splitType}
                  onChange={(e) => {
                    setFormData({ ...formData, splitType: e.target.value });
                    if (e.target.value === "equal") {
                      calculateEqualSplit();
                    }
                  }}
                >
                  <option value="equal">Equal</option>
                  <option value="unequal">Unequal</option>
                </select>
              </div>
              {formData.splitType === "equal" && formData.amount && (
                <button
                  type="button"
                  onClick={calculateEqualSplit}
                  className="btn-secondary"
                >
                  Calculate Equal Split
                </button>
              )}
              <div className="form-group">
                <label>Split Between</label>
                {trip.members.map((member) => (
                  <div key={member.user._id} className="split-input">
                    <label>{member.user.name}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={
                        formData.splits.find((s) => s.user === member.user._id)
                          ?.amount || ""
                      }
                      onChange={(e) =>
                        handleSplitChange(member.user._id, e.target.value)
                      }
                      required
                    />
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="expenses-list">
        {expenses.length === 0 ? (
          <div className="empty-state">
            <p>No expenses yet. Add your first expense!</p>
          </div>
        ) : (
          expenses.map((expense) => (
            <div key={expense._id} className="expense-card">
              <div className="expense-header">
                <h4>{expense.description}</h4>
                <span className="expense-amount">
                  {currencyConverter.format(expense.amount, expense.currency)}
                </span>
              </div>
              <div className="expense-details">
                <p>
                  Paid by: <strong>{expense.paidBy.name}</strong>
                </p>
                <p>
                  Split between:{" "}
                  {expense.splits.map((split, idx) => (
                    <span key={idx}>
                      {split.user.name} (
                      {currencyConverter.format(split.amount, expense.currency)})
                      {idx < expense.splits.length - 1 && ", "}
                    </span>
                  ))}
                </p>
                <p className="expense-date">
                  {new Date(expense.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpensesTab;

