// routes/auth.routes.js
import express from "express";
import { signup, login, checkUser } from "../controllers/auth.controller.js";

const router = express.Router();

// Sign up and Login
router.post("/signup", signup);
router.post("/login", login);

// New: Check if a user exists by email
// Supports both GET and POST for convenience
router.get("/check", checkUser);
router.post("/check", checkUser);

export default router;
