// routes/location.routes.js
import express from 'express';
import { 
  updateTechnicianLocation, 
  getNearbyTechnicians,
  getTechnicianLocation,
  updateTechnicianAvailability 
} from '../controllers/location.controller.js';
import { verifyJWT } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/nearby', getNearbyTechnicians);

// Protected routes - require authentication
router.use(verifyJWT);

// Technician routes
router.patch('/update', updateTechnicianLocation);
router.get('/me', getTechnicianLocation);
router.patch('/availability', updateTechnicianAvailability);

export default router;