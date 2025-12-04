import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  createTrip,
  getTrip,
  getUserTrips,
  joinTrip,
  updateMemberRole,
  finalizeTrip
} from "../controllers/tripController.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", createTrip);
router.get("/", getUserTrips);
router.get("/:tripId", getTrip);
router.post("/join", joinTrip);
router.patch("/:tripId/role", updateMemberRole);
router.patch("/:tripId/finalize", finalizeTrip);

export default router;

