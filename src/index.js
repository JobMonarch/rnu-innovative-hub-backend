import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import fakeAuth from "./middleware/fakeAuth.js";
import usersRoutes from "./routes/users.routes.js";
import aiRoutes from "./routes/ai.routes.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/v1/auth", authRoutes);
app.use(fakeAuth);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/ai", aiRoutes);

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// Health check route
app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

