import express from "express";
import { users } from "../data/users.js";

const router = express.Router();

// REGISTER
router.post("/register", (req, res) => {
  const { name, email, password, role, department } = req.body;

  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = {
    name,
    email,
    password, //  plain text for now (OK for demo)
    role,
    department,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(user);

  res.json({
    token: "fake-jwt-token",
    user
  });
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    token: "fake-jwt-token",
    user
  });
});

// ME
router.get("/me", (req, res) => {
  // Token not verified yet – demo only
  const email = req.headers["x-user-email"];
  const user = users.find(u => u.email === email);

  res.json({ user: user || null });
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.json({ ok: true });
});

export default router;
