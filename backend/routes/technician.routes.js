// routes/technician.routes.js
import express from "express";
import { verifyJWT, requireRole } from "../middleware/auth.js";
import { 
  getSummary, 
  listJobs, 
  updateJobStatus,
  getTechnicianProfile,
  updateTechnicianProfile,
  getAllTechnicians
} from "../controllers/technician.controller.js";

const router = express.Router();

// Public routes
router.get('/all', getAllTechnicians);

// Protected routes for technicians only
router.use(verifyJWT, requireRole('technician'));
router.get('/summary', getSummary);
router.get('/jobs', listJobs);
router.patch('/jobs/:id', updateJobStatus);
router.get('/profile', getTechnicianProfile);
router.patch('/profile', updateTechnicianProfile);

export default router;