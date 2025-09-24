// routes/skills.routes.js
// Routes for skills and service categories management

import express from "express";
import {
  getServiceCategories,
  getAllSkills,
  getPopularSkills,
  getSkillsByCategory,
  validateSkillsEndpoint,
  searchSkills
} from "../controllers/skills.controller.js";

const router = express.Router();

// GET /api/skills/categories - Get all service categories
router.get("/categories", getServiceCategories);

// GET /api/skills/all - Get all available skills
router.get("/all", getAllSkills);

// GET /api/skills/popular - Get popular/recommended skills
router.get("/popular", getPopularSkills);

// GET /api/skills/search - Search skills by keyword
router.get("/search", searchSkills);

// GET /api/skills/category/:categoryKey - Get skills by category
router.get("/category/:categoryKey", getSkillsByCategory);

// POST /api/skills/validate - Validate skills
router.post("/validate", validateSkillsEndpoint);

export default router;