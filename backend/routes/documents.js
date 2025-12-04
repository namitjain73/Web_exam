import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  uploadDocument,
  getTripDocuments,
  deleteDocument
} from "../controllers/documentController.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", uploadDocument);
router.get("/trip/:tripId", getTripDocuments);
router.delete("/:documentId", deleteDocument);

export default router;

