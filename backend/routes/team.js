import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  createTeam,
  requestToJoin,
  acceptRequest,
  rejectRequest,
  getMyTeams
} from "../controllers/team.js";

const router = express.Router();

router.post("/create", requireAuth, createTeam);
router.post("/request/:teamId", requireAuth, requestToJoin);
router.post("/accept/:teamId/:userId", requireAuth, acceptRequest);
router.post("/reject/:teamId/:userId", requireAuth, rejectRequest);
router.get("/mine", requireAuth, getMyTeams);

export default router;
