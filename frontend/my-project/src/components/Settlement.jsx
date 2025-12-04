import React, { useState, useEffect } from 'react';
import { settlementAPI, getSocket } from '../services/api';
import '../styles/Settlement.css';

const Settlement = ({ tripId, trip }) => {
  const [settlement, setSettlement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettlement();
    const socket = getSocket();
    if (socket) {
      socket.on('settlement-updated', loadSettlement);
    }
    return () => {
      if (socket) socket.off('settlement-updated', loadSettlement);
    };
  }, [tripId]);

  const loadSettlement = async () => {
    try {
      const response = await settlementAPI.getSettlement(tripId);
      setSettlement(response.data);
    } catch (err) {
      console.error('Failed to load settlement');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (transactionIndex) => {
    try {
      const response = await settlementAPI.markTransactionComplete(settlement._id, transactionIndex);
      setSettlement(response.data);
    } catch (err) {
      console.error('Failed to mark transaction complete');
    }
  };

  if (loading) return <div className="loading">Calculating settlements...</div>;
  if (!settlement) return <div className="error">No settlement data</div>;

  return (
    <div className="settlement-container">
      <h2>Settlement Summary</h2>

      <div className="settlement-stats">
        <div className="stat-card">
          <h3>Total Expenses</h3>
          <p className="value">${settlement.totalExpense?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="stat-card">
          <h3>Per Person Share</h3>
          <p className="value">${settlement.perPersonShare?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="stat-card">
          <h3>Transactions</h3>
          <p className="value">{settlement.transactions?.length || 0}</p>
        </div>
      </div>

      <div className="settlement-section">
        <h3>💰 Who Owes Whom (Simplified)</h3>
        <div className="transactions-list">
          {settlement.transactions && settlement.transactions.length > 0 ? (
            settlement.transactions.map((transaction, index) => (
              <div key={index} className={`transaction-item status-${transaction.status}`}>
                <div className="transaction-info">
                  <p className="transaction-text">
                    <strong>{transaction.from?.name}</strong> owes 
                    <strong> {transaction.to?.name}</strong>
                  </p>
                  <p className="amount">${transaction.amount?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="transaction-status">
                  {transaction.status === 'pending' ? (
                    <button 
                      className="btn-secondary"
                      onClick={() => handleMarkComplete(index)}
                    >
                      Mark as Paid
                    </button>
                  ) : (
                    <span className="status-badge completed">✓ Completed</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="empty-message">No transactions needed - expenses are balanced!</p>
          )}
        </div>
      </div>

      <div className="settlement-section">
        <h3>👤 Individual Balances</h3>
        <div className="balances-list">
          {settlement.balances && settlement.balances.map((balance, index) => {
            const isPositive = balance.balance > 0;
            return (
              <div key={index} className={`balance-item ${isPositive ? 'owed' : 'owes'}`}>
                <div className="balance-info">
                  <h4>{balance.userId?.name}</h4>
                  <p className={isPositive ? 'positive' : 'negative'}>
                    {isPositive ? '💲 Owed: ' : '💸 Owes: '}
                    <strong>${Math.abs(balance.balance).toFixed(2)}</strong>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="settlement-info">
        <h3>📋 How It Works</h3>
        <ul>
          <li>All expenses are totaled</li>
          <li>Individual balances are calculated</li>
          <li>Debts are simplified using the Min-Cash-Flow algorithm</li>
          <li>Minimum number of transactions needed</li>
          <li>Mark transactions as paid to track settlement</li>
        </ul>
      </div>
    </div>
  );
};

export default Settlement;
