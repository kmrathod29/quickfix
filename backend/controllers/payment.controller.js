// controllers/payment.controller.js
import Stripe from 'stripe';
import Payment from '../models/payment.model.js';
import Booking from '../models/booking.model.js';

const stripeSecret = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

function getBaseUrl(req) {
  const envBase = process.env.FRONTEND_BASE_URL;
  if (envBase) return envBase.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || 'localhost:9000';
  return `${proto}://${host}`;
}

// Dev checkout external JS to satisfy CSP (no inline scripts)
export async function devCheckoutScript(req, res) {
  try {
    const { bookingId, amount } = req.query;
    const amt = Number(amount || 4900);
    const displayAmount = (amt / 100).toFixed(2);
    const successUrl = getBaseUrl(req) + `/api/payments/success?bookingId=${bookingId}`;
    const markPaidUrl = getBaseUrl(req) + `/api/payments/dev/success?bookingId=${bookingId}`;

    const js = `(() => {
      const btn = document.getElementById('payBtn');
      if (!btn) return;
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Processing...';
        try {
          const res = await fetch('${markPaidUrl}');
          if (!res.ok) throw new Error('Failed to mark paid');
          window.location.href = '${successUrl}';
        } catch (e) {
          alert((e && e.message) || 'Payment failed');
          btn.disabled = false;
          btn.textContent = 'Pay $${displayAmount}';
        }
      });
    })();`;

    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    return res.send(js);
  } catch (err) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    return res.send(`alert(${JSON.stringify(err.message || 'Error')});`);
  }
}

export async function createCheckoutSession(req, res) {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ message: 'bookingId is required' });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.userId) !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const amount = Math.max(1, Math.round((booking.price || Number(process.env.DEFAULT_BOOKING_PRICE || 49)) * 100));

    // Helper to build dev checkout URL
    const devCheckoutUrl = getBaseUrl(req) + `/api/payments/dev/checkout?bookingId=${booking._id}&amount=${amount}`;

    if (!stripe) {
      // Graceful fallback: create a Payment record and return a dev checkout page
      await Payment.create({
        bookingId: booking._id,
        userId: req.user.userId,
        amount,
        currency: 'usd',
        provider: 'dev',
        status: 'created',
      });
      return res.json({ url: devCheckoutUrl, dev: true });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: { name: booking.serviceType || 'QuickFix Service' },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        success_url: getBaseUrl(req) + '/api/payments/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: getBaseUrl(req) + '/api/payments/cancelled',
        metadata: { bookingId: String(booking._id), userId: String(booking.userId) },
        customer_email: booking.email || undefined,
      });

      await Payment.create({
        bookingId: booking._id,
        userId: req.user.userId,
        amount,
        currency: 'usd',
        provider: 'stripe',
        stripeSessionId: session.id,
        status: 'created',
      });

      return res.json({ url: session.url });
    } catch (stripeErr) {
      // Stripe misconfigured/invalid key – fall back to dev checkout page
      console.warn('Stripe error, falling back to dev checkout:', stripeErr.message);
      await Payment.create({
        bookingId: booking._id,
        userId: req.user.userId,
        amount,
        currency: 'usd',
        provider: 'dev',
        status: 'created',
      });
      return res.json({ url: devCheckoutUrl, dev: true, reason: stripeErr.message });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function paymentSuccessPage(req, res) {
  try {
    const sessionId = req.query.session_id;
    const bookingIdFromQuery = req.query.bookingId;
    if (!sessionId && !bookingIdFromQuery) {
      return res.status(400).send('<h1>Payment</h1><p>Missing session/booking information.</p>');
    }

    // Always support dev success by bookingId, even if Stripe is configured
    if (bookingIdFromQuery) {
      const booking = await Booking.findByIdAndUpdate(bookingIdFromQuery, { paymentStatus: 'paid' }, { new: true });
      return res.send(`<h1>Payment (DEV) Succeeded</h1><p>Booking ${booking?._id} marked as paid.</p>`);
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session && session.payment_status === 'paid') {
      const bookingId = session.metadata?.bookingId;
      await Promise.all([
        Payment.findOneAndUpdate(
          { stripeSessionId: session.id },
          { status: 'succeeded', stripePaymentIntentId: session.payment_intent }
        ),
        bookingId ? Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid' }) : Promise.resolve(),
      ]);
      return res.send('<h1>Payment Succeeded</h1><p>You can close this window and return to the app.</p>');
    }
    return res.send('<h1>Payment Pending</h1><p>Your payment is being processed.</p>');
  } catch (err) {
    return res.status(500).send(`<h1>Error</h1><p>${err.message}</p>`);
  }
}

export async function paymentCancelledPage(req, res) {
  res.send('<h1>Payment Cancelled</h1><p>You cancelled the checkout.</p>');
}

// Stripe webhook (optional if billing enabled)
export async function stripeWebhook(req, res) {
  try {
    if (!stripe) return res.status(200).send('ok');
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event = req.body;

    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const bookingId = session.metadata?.bookingId;
        await Promise.all([
          Payment.findOneAndUpdate(
            { stripeSessionId: session.id },
            { status: 'succeeded', stripePaymentIntentId: session.payment_intent, raw: session }
          ),
          bookingId ? Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid' }) : Promise.resolve(),
        ]);
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}

// Dev helper if Stripe not configured
export async function devMarkPaid(req, res) {
  try {
    const { bookingId } = req.query;
    if (!bookingId) return res.status(400).json({ message: 'bookingId is required' });
    const booking = await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid' }, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Dev checkout page (simple, realistic mock)
export async function devCheckoutPage(req, res) {
  try {
    const { bookingId, amount } = req.query;
    if (!bookingId) return res.status(400).send('<h1>Payment</h1><p>Missing bookingId.</p>');

    const amt = Number(amount || 4900);
    const displayAmount = (amt / 100).toFixed(2);

    const successUrl = getBaseUrl(req) + `/api/payments/success?bookingId=${bookingId}`;
    const markPaidUrl = getBaseUrl(req) + `/api/payments/dev/success?bookingId=${bookingId}`;

    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>QuickFix Checkout</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background:#f8fafc; margin:0; }
      .wrap { max-width: 480px; margin: 40px auto; background:#fff; border-radius:12px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); overflow:hidden; }
      .header { padding: 20px 24px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; justify-content:space-between; }
      .brand { font-weight: 700; color:#0f172a; }
      .content { padding: 24px; }
      .row { margin-bottom:12px; }
      label { display:block; font-size: 12px; color:#475569; margin-bottom:6px; }
      input { width: 100%; padding: 10px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; }
      .total { display:flex; align-items:center; justify-content:space-between; padding: 14px 16px; background:#f1f5f9; border-radius:10px; margin: 16px 0; }
      .btn { display:inline-flex; align-items:center; justify-content:center; width:100%; background:#2563eb; color:#fff; border:0; padding:12px 16px; border-radius:10px; font-weight:600; cursor:pointer; }
      .btn:disabled { opacity:0.7; cursor:not-allowed; }
      .note { font-size:12px; color:#64748b; margin-top:8px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header">
        <div class="brand">QuickFix Checkout</div>
        <div style="color:#64748b">Secure Payment</div>
      </div>
      <div class="content">
        <div class="row">
          <label>Card Number</label>
          <input id="card" placeholder="4242 4242 4242 4242" value="4242 4242 4242 4242" />
        </div>
        <div class="row" style="display:flex; gap:12px;">
          <div style="flex:1">
            <label>Expiry</label>
            <input id="exp" placeholder="12/34" value="12/34" />
          </div>
          <div style="width:120px">
            <label>CVV</label>
            <input id="cvv" placeholder="123" value="123" />
          </div>
        </div>
        <div class="total">
          <div>Amount</div>
          <div style="font-weight:700">$${displayAmount}</div>
        </div>
        <button id="payBtn" class="btn">Pay $${displayAmount}</button>
        <div class="note">Use the prefilled test card. This is a demo payment.</div>
      </div>
    </div>
    <script src="${getBaseUrl(req) + `/api/payments/dev/checkout.js?bookingId=${bookingId}&amount=${amt}`}"></script>
  </body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch (err) {
    return res.status(500).send(`<h1>Error</h1><p>${err.message}</p>`);
  }
}
