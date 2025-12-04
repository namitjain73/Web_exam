import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import tripRoutes from "./routes/trips.js";
import expenseRoutes from "./routes/expenses.js";
import activityRoutes from "./routes/activities.js";
import voteRoutes from "./routes/votes.js";
import documentRoutes from "./routes/documents.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

app.get("/", (req, res) => {
  res.send("Travel Planner API Running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/documents", documentRoutes);

app.get('/', (req, res) => {
  res.send('Travel Planner Backend Running. Data logic for polls is handled via Firebase/Firestore SDK in the frontend.');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
