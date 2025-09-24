// routes/payments.routes.js
import express from 'express';
import { verifyJWT } from '../middleware/auth.js';
import {
  createCheckoutSession,
  paymentSuccessPage,
  paymentCancelledPage,
  stripeWebhook,
  devMarkPaid,
  devCheckoutPage,
  devCheckoutScript,
} from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/checkout-session', verifyJWT, createCheckoutSession);
router.get('/success', paymentSuccessPage);
router.get('/cancelled', paymentCancelledPage);

// Stripe webhook: must use raw body; this route will be mounted with raw parser in server.js
router.post('/webhook', stripeWebhook);

// Dev helper pages
router.get('/dev/checkout', devCheckoutPage);
router.get('/dev/checkout.js', devCheckoutScript);
router.get('/dev/success', devMarkPaid);

export default router;