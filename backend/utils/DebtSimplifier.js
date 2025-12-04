/**
 * Min-Cash-Flow Algorithm for Debt Settlement
 * Simplifies multiple debts into minimum number of transactions
 */

class DebtSimplifier {
  /**
   * Calculate minimum transactions to settle all debts
   * @param {Array} expenses - Array of expenses with paidBy and splitBetween
   * @param {Array} members - Array of trip members
   * @returns {Object} - Simplified transactions and balances
   */
  static simplifyDebts(expenses, members) {
    // Calculate balance for each member
    const balances = {};
    
    members.forEach(member => {
      balances[member._id?.toString() || member] = 0;
    });

    // Calculate initial balances
    expenses.forEach(expense => {
      const paidById = expense.paidBy._id?.toString() || expense.paidBy;
      balances[paidById] = (balances[paidById] || 0) + expense.amount;

      expense.splitBetween.forEach(split => {
        const userId = split.userId._id?.toString() || split.userId;
        const shareAmount = this.calculateShare(expense.amount, split.share, split.shareType);
        balances[userId] = (balances[userId] || 0) - shareAmount;
      });
    });

    // Find creditors and debtors
    const creditors = [];
    const debtors = [];

    Object.entries(balances).forEach(([userId, balance]) => {
      if (balance > 0.01) creditors.push({ userId, amount: balance });
      if (balance < -0.01) debtors.push({ userId, amount: Math.abs(balance) });
    });

    // Simplify transactions
    const transactions = [];
    let i = 0, j = 0;

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];
      
      const settleAmount = Math.min(creditor.amount, debtor.amount);
      
      transactions.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: parseFloat(settleAmount.toFixed(2))
      });

      creditor.amount -= settleAmount;
      debtor.amount -= settleAmount;

      if (creditor.amount < 0.01) i++;
      if (debtor.amount < 0.01) j++;
    }

    return {
      transactions,
      balances,
      creditors: creditors.filter(c => c.amount > 0.01),
      debtors: debtors.filter(d => d.amount > 0.01)
    };
  }

  /**
   * Calculate share amount based on share type
   */
  static calculateShare(totalAmount, share, shareType) {
    switch (shareType) {
      case 'percentage':
        return (totalAmount * share) / 100;
      case 'exact':
        return share;
      case 'equal':
      default:
        return share > 0 ? totalAmount / share : 0;
    }
  }

  /**
   * Convert expense to target currency
   */
  static async convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    
    try {
      const response = await require('axios').get(
        `${process.env.EXCHANGE_RATE_API}${fromCurrency}`
      );
      const rate = response.data.rates[toCurrency];
      return parseFloat((amount * rate).toFixed(2));
    } catch (error) {
      console.error('Currency conversion error:', error);
      return amount;
    }
  }
}

module.exports = DebtSimplifier;
