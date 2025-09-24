// routes/services.routes.js
import express from "express";
import { body } from "express-validator";
import { listServices, getServiceById, createService, updateService } from "../controllers/service.controller.js";
import { verifyJWT, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", listServices);
router.get("/:id", getServiceById);

// Admin routes
router.post(
  "/",
  verifyJWT,
  requireRole("admin"),
  [body("name").notEmpty(), body("basePrice").isNumeric()],
  createService
);

router.patch(
  "/:id",
  verifyJWT,
  requireRole("admin"),
  updateService
);

export default router;
