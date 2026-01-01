import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password, role, department } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({ name, email, password, role, department });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
    res.json({
      token,
      user: { ...user.toObject(), password: undefined }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
    res.json({
      token,
      user: { ...user.toObject(), password: undefined }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ME
router.get("/me", async (req, res) => {
  // Token should be sent as Authorization: Bearer <token>
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    res.json({ user: user ? { ...user.toObject(), password: undefined } : null });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.json({ ok: true });
});

export default router;
