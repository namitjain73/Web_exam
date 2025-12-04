import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  createVote,
  getTripVotes,
  castVote
} from "../controllers/voteController.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", createVote);
router.get("/trip/:tripId", getTripVotes);
router.post("/:voteId/vote", castVote);

export default router;

