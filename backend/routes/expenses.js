import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  createExpense,
  getTripExpenses,
  getDebtSummary,
  settleExpense,
  deleteExpense
} from "../controllers/expenseController.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", createExpense);
router.get("/trip/:tripId", getTripExpenses);
router.get("/trip/:tripId/summary", getDebtSummary);
router.post("/settle", settleExpense);
router.delete("/:expenseId", deleteExpense);

export default router;

