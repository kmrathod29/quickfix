// routes/bookings.routes.js
import express from "express";
import { createBooking, getBookingById } from "../controllers/booking.controller.js";
import { verifyJWT } from "../middleware/auth.js";

const router = express.Router();

// Protect booking APIs: user must be logged in (JWT required)
// This ensures only authenticated users can create or view bookings.
router.post("/", verifyJWT, createBooking);
router.get("/:id", verifyJWT, getBookingById);

export default router;
