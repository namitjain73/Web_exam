# Debt Simplification Algorithm Explanation

## Overview

The Travel Planner uses a **Min-Cash Flow** algorithm to minimize the number of transactions needed to settle all debts among group members. This is crucial for group trips where multiple people pay for different expenses and need to settle up efficiently.

## Problem Statement

When multiple people pay for shared expenses, we need to determine:
1. Who owes money to whom
2. The minimum number of transactions to settle all debts

### Example Scenario

Consider a trip with 3 friends:
- **Alice** paid $100 for dinner, but only owes $30 (her share)
- **Bob** paid $50 for taxi, but owes $60 (his share)
- **Charlie** paid $0, but owes $40 (his share)

**Net Balances:**
- Alice: +$70 (she is owed $70)
- Bob: -$10 (he owes $10)
- Charlie: -$40 (he owes $40)

## Algorithm Steps

### Step 1: Calculate Net Balances

For each member, calculate:
```
Net Balance = Total Paid - Total Owed
```

This gives us:
- **Creditors**: Members with positive balance (owed money)
- **Debtors**: Members with negative balance (owe money)

### Step 2: Greedy Matching

The algorithm uses a greedy approach:

1. Sort creditors by amount (largest first)
2. Sort debtors by amount (largest first)
3. Match the largest debtor with the largest creditor
4. Settle the maximum possible amount
5. Repeat until all debts are settled

### Step 3: Generate Transactions

For each match, create a transaction:
```
From: Debtor
To: Creditor
Amount: Minimum of (debtor amount, creditor amount)
```

## Implementation Example

```javascript
// Input: Expenses with splits
const expenses = [
  { paidBy: "Alice", amount: 100, splits: [
    { user: "Alice", amount: 30 },
    { user: "Bob", amount: 30 },
    { user: "Charlie", amount: 40 }
  ]},
  { paidBy: "Bob", amount: 50, splits: [
    { user: "Alice", amount: 20 },
    { user: "Bob", amount: 20 },
    { user: "Charlie", amount: 10 }
  ]}
];

// Step 1: Calculate net balances
// Alice: 100 - 50 = +50
// Bob: 50 - 50 = 0
// Charlie: 0 - 50 = -50

// Step 2: Separate creditors and debtors
// Creditors: [{ userId: "Alice", amount: 50 }]
// Debtors: [{ userId: "Charlie", amount: 50 }]

// Step 3: Match and generate transactions
// Result: Charlie → Alice: $50
// Only 1 transaction needed!
```

## Complexity

- **Time Complexity**: O(n log n) where n is the number of members
  - Sorting: O(n log n)
  - Matching: O(n)
- **Space Complexity**: O(n) for storing balances and transactions

## Why This Works

The greedy approach works because:
1. **Optimal Substructure**: Settling the largest debts first reduces the problem size
2. **Greedy Choice Property**: Matching largest debtor with largest creditor is always optimal
3. **Minimizes Transactions**: By settling maximum amounts, we reduce the number of transactions needed

## Real-World Example

**Before Simplification:**
- A owes B $10
- B owes C $10
- C owes A $5

**After Simplification:**
- A owes C $5
- (B is settled)

**Result**: 1 transaction instead of 3!

## Code Location

The algorithm is implemented in:
- `backend/utils/debtSimplifier.js`
- Used by: `backend/controllers/expenseController.js` → `getDebtSummary`

## Testing

To test the algorithm:
1. Create a trip with multiple members
2. Add expenses with different splits
3. View the debt summary
4. Verify the transactions minimize the number of payments needed

