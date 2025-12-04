import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  try {
    const { name, email, password, dob, gender } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing required fields" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({
      name,
      email,
      password,
      dob,
      gender
    });

    return res.json({
      message: "Registration successful",
      userId: user._id
    });
  } catch (err) {
    return res.status(500).json({ message: "Error", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refresh = jwt.sign(
      { id: user._id },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      refresh,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    return res.status(500).json({ message: "Error", error: err.message });
  }
};
export const refreshAccessToken = async (req, res) => {
  try {
    const { refresh } = req.body;

    if (!refresh)
      return res.status(400).json({ message: "Refresh token required" });

    jwt.verify(refresh, process.env.REFRESH_SECRET, async (err, payload) => {
      if (err) return res.status(401).json({ message: "Invalid refresh token" });

      const user = await User.findById(payload.id);
      if (!user)
        return res.status(404).json({ message: "User not found" });

      const newAccess = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      const newRefresh = jwt.sign(
        { id: user._id },
        process.env.REFRESH_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Token refreshed",
        token: newAccess,
        refresh: newRefresh
      });
    });
  } catch (err) {
    return res.status(500).json({ message: "Error", error: err.message });
  }
};
export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Error", error: err.message });
  }
};
