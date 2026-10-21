const express = require('express');
const crypto = require('crypto');
const { z } = require('zod');
const Payment = require('../models/Payment');
const ParkingSession = require('../models/ParkingSession');
const Tariff = require('../models/Tariff');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { calculateFee } = require('../utils/fee');

const router = express.Router();

const createSchema = z.object({
  ticketCode: z.string().min(1),
  method: z.enum(['qris', 'ewallet', 'card', 'cash']),
});

// Inisiasi pembayaran. Idempoten: jika sudah ada pembayaran pending untuk sesi ini, dikembalikan lagi.
router.post('/', authenticate, validate(createSchema), async (req, res, next) => {
  try {
    const session = await ParkingSession.findOne({ ticketCode: req.body.ticketCode });
    if (!session) return res.status(404).json({ message: 'Tiket tidak ditemukan' });
    if (session.status !== 'active') return res.status(409).json({ message: 'Sesi tidak bisa dibayar' });

    const pending = await Payment.findOne({ sessionId: session._id, status: 'pending' });
    if (pending) return res.json(pending);

    const tariff = await Tariff.findOne({ vehicleType: session.vehicleType });
    const amount = calculateFee(session.entryTime, new Date(), tariff);

    const payment = await Payment.create({
      sessionId: session._id,
      orderId: 'PAY-' + crypto.randomBytes(8).toString('hex').toUpperCase(),
      method: req.body.method,
      amount,
    });
    // TODO: panggil API Midtrans/Xendit di sini, lalu kembalikan QR/deeplink dari gateway
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
});

// Webhook dari payment gateway. Diverifikasi dengan HMAC atas raw body.
router.post('/webhook', async (req, res, next) => {
  try {
    const signature = req.headers['x-signature'] || '';
    const expected = crypto
      .createHmac('sha256', process.env.PAYMENT_WEBHOOK_SECRET)
      .update(req.rawBody || '')
      .digest('hex');

    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(401).json({ message: 'Signature tidak valid' });
    }

    const { orderId, status } = req.body; // sesuaikan dengan format gateway
    const payment = await Payment.findOne({ orderId });
    if (!payment) return res.status(404).json({ message: 'Order tidak ditemukan' });
    if (payment.status !== 'pending') return res.json({ message: 'Sudah diproses' }); // idempoten

    if (status === 'paid') {
      payment.status = 'paid';
      payment.paidAt = new Date();
      await payment.save();
      await ParkingSession.updateOne(
        { _id: payment.sessionId },
        { status: 'paid', fee: payment.amount, paidAt: payment.paidAt }
      );
    } else {
      payment.status = 'failed';
      await payment.save();
    }
    res.json({ message: 'OK' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
