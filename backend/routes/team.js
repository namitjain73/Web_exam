import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  createTeam,
  requestToJoin,
  acceptRequest,
  rejectRequest,
  getMyTeams
} from "../controllers/team.js";
import { getTeamDetails, addDocument, createPoll, votePoll } from "../controllers/team.js";

const router = express.Router();

router.post("/create", requireAuth, createTeam);
router.post("/request/:teamId", requireAuth, requestToJoin);
router.post("/accept/:teamId/:userId", requireAuth, acceptRequest);
router.post("/reject/:teamId/:userId", requireAuth, rejectRequest);
router.get("/mine", requireAuth, getMyTeams);

// team details
router.get("/:teamId", requireAuth, getTeamDetails);

// documents (simple url-based)
router.post("/:teamId/document", requireAuth, addDocument);

// polls
router.post("/:teamId/poll", requireAuth, createPoll);
router.post("/:teamId/poll/:pollId/vote", requireAuth, votePoll);

export default router;
