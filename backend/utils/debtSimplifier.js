/**
 * Min-Cash Flow Algorithm
 * Minimizes the number of transactions needed to settle all debts
 * Uses a greedy approach to simplify the debt graph
 */

export function simplifyDebts(expenses, members) {
  // Step 1: Calculate net balance for each member
  const balances = {};
  members.forEach((member) => {
    balances[member.user.toString()] = 0;
  });

  // Calculate net balance (what they paid - what they owe)
  expenses.forEach((expense) => {
    const paidBy = expense.paidBy.toString();
    balances[paidBy] = (balances[paidBy] || 0) + expense.amount;

    expense.splits.forEach((split) => {
      const userId = split.user.toString();
      balances[userId] = (balances[userId] || 0) - split.amount;
    });
  });

  // Step 2: Separate creditors (positive balance) and debtors (negative balance)
  const creditors = [];
  const debtors = [];

  Object.entries(balances).forEach(([userId, balance]) => {
    if (balance > 0.01) {
      // Small threshold to avoid floating point issues
      creditors.push({ userId, amount: balance });
    } else if (balance < -0.01) {
      debtors.push({ userId, amount: Math.abs(balance) });
    }
  });

  // Sort by amount (largest first)
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  // Step 3: Greedy algorithm to minimize transactions
  const transactions = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    const amount = Math.min(creditor.amount, debtor.amount);

    transactions.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: parseFloat(amount.toFixed(2))
    });

    creditor.amount -= amount;
    debtor.amount -= amount;

    if (creditor.amount < 0.01) {
      creditorIndex++;
    }
    if (debtor.amount < 0.01) {
      debtorIndex++;
    }
  }

  return {
    balances,
    transactions,
    summary: transactions.map((t) => ({
      from: t.from,
      to: t.to,
      amount: t.amount
    }))
  };
}

/**
 * Calculate individual balances for a user
 */
export function calculateUserBalance(userId, expenses) {
  let paid = 0;
  let owes = 0;

  expenses.forEach((expense) => {
    if (expense.paidBy.toString() === userId.toString()) {
      paid += expense.amount;
    }

    const userSplit = expense.splits.find(
      (split) => split.user.toString() === userId.toString()
    );
    if (userSplit) {
      owes += userSplit.amount;
    }
  });

  return {
    paid,
    owes,
    net: paid - owes,
    status: paid > owes ? "owed" : "owes"
  };
}

