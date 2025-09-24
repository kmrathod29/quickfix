// controllers/auth.controller.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { validateSkills, ALL_AVAILABLE_SKILLS } from "../constants/serviceSkills.js";

// Simple signup controller
// - Checks required fields
// - Hashes password
// - Creates user in MongoDB
// - Returns JWT token and basic user info
export const signup = async (req, res) => {
  try {
    const { name, email, password, phone, role, address, skills } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    // Build payload
    const userPayload = {
      name,
      email,
      passwordHash: hashedPassword,
      phone,
      role: role || 'user',
      address,
    };

    // If technician, validate and persist skills (normalized)
    if ((role || 'user') === 'technician') {
      if (!skills || !Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({ message: "Technicians must select at least one skill/specialization" });
      }
      
      const clean = [...new Set(skills.map(s => String(s).trim().toLowerCase()).filter(Boolean))];
      
      // Validate skills against predefined list
      if (!validateSkills(clean)) {
        return res.status(400).json({ 
          message: "Invalid skills selected. Please choose from available services.",
          availableSkills: ALL_AVAILABLE_SKILLS
        });
      }
      
      if (clean.length === 0) {
        return res.status(400).json({ message: "Please select at least one valid skill" });
      }
      
      userPayload.skills = clean;
    }

    const user = await User.create(userPayload);

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Simple login controller
// - Checks if user exists
// - Compares password
// - Returns JWT token and basic user info
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ success: true, token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// New: Check if a user exists by email
// This lets the frontend decide whether to show Login or Sign Up.
// You can call it with either:
// - GET  /api/auth/check?email=user@example.com
// - POST /api/auth/check  { email: "user@example.com" }
export const checkUser = async (req, res) => {
  try {
    const email = (req.body?.email || req.query?.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    const exists = !!user;

    // Tell the client the next action to take
    return res.status(200).json({ exists, next: exists ? 'login' : 'signup' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
