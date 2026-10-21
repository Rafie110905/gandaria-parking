const express = require('express');
const Payment = require('../models/Payment');
const ParkingSession = require('../models/ParkingSession');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/reports/daily?date=2026-10-21 (default: hari ini)
router.get('/daily', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const day = req.query.date ? new Date(req.query.date) : new Date();
    if (Number.isNaN(day.getTime())) return res.status(400).json({ message: 'Format date salah (YYYY-MM-DD)' });
    const start = new Date(day); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 1);

    const [entries, exits, revenue] = await Promise.all([
      ParkingSession.countDocuments({ entryTime: { $gte: start, $lt: end } }),
      ParkingSession.countDocuments({ exitTime: { $gte: start, $lt: end } }),
      Payment.aggregate([
        { $match: { status: 'paid', paidAt: { $gte: start, $lt: end } } },
        { $group: { _id: '$method', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      date: start.toISOString().slice(0, 10),
      entries,
      exits,
      revenueByMethod: revenue,
      totalRevenue: revenue.reduce((s, r) => s + r.total, 0),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
