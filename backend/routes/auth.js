import express from "express";
import {
  register,
  login,
  refreshAccessToken,
  me
} from "../controllers/auth.js";

// import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// REGISTER
router.post("/register", register);

// LOGIN
router.post("/login", login);

// REFRESH TOKEN
router.post("/refresh-token", refreshAccessToken);

// CURRENT USER
import { requireAuth } from "../middlewares/requireAuth.js";
router.get("/me", requireAuth, me);

export default router;
