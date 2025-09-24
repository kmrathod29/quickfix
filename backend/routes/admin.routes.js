// routes/admin.routes.js
import express from "express";
import { verifyJWT, requireRole } from "../middleware/auth.js";
import { getSummary, listBookings, updateBookingStatus, listUsers, assignTechnician } from "../controllers/admin.controller.js";

const router = express.Router();

// All admin routes require JWT + admin role
router.use(verifyJWT, requireRole('admin'));

router.get('/summary', getSummary);
router.get('/bookings', listBookings);
router.patch('/bookings/:id', updateBookingStatus);
router.patch('/bookings/:id/assign', assignTechnician);
router.get('/users', listUsers);

export default router;