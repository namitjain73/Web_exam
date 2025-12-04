import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import teamRoutes from "./routes/team.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
const MONGO_URI="mongodb://127.0.0.1:27017/examdb"
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

app.get("/", (req, res) => {
  res.send("API Running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/team", teamRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
