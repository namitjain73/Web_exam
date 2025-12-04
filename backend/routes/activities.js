import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  createActivity,
  getTripActivities,
  updateActivity,
  updateActivityStatus,
  deleteActivity
} from "../controllers/activityController.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", createActivity);
router.get("/trip/:tripId", getTripActivities);
router.patch("/:activityId", updateActivity);
router.patch("/:activityId/status", updateActivityStatus);
router.delete("/:activityId", deleteActivity);

export default router;

