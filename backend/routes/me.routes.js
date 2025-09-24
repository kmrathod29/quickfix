// routes/me.routes.js
import express from "express";
import { verifyJWT } from "../middleware/auth.js";
import { getProfile, updateProfile, getSummary, listMyBookings } from "../controllers/me.controller.js";

const router = express.Router();

router.use(verifyJWT);
router.get('/', getProfile);
router.patch('/', updateProfile);
router.get('/summary', getSummary);
router.get('/bookings', listMyBookings);

export default router;