// routes/reviews.routes.js
import express from 'express';
import { verifyJWT } from '../middleware/auth.js';
import { createReview, listReviewsForTechnician } from '../controllers/review.controller.js';

const router = express.Router();

router.post('/', verifyJWT, createReview);
router.get('/technician/:id', listReviewsForTechnician);

export default router;