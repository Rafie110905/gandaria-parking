const express = require('express');
const { z } = require('zod');
const ParkingSession = require('../models/ParkingSession');
const Slot = require('../models/Slot');
const Tariff = require('../models/Tariff');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { calculateFee } = require('../utils/fee');
const { generateTicketCode } = require('../utils/ticket');

const router = express.Router();
const gateStaff = [authenticate, authorize('admin', 'operator')];

const entrySchema = z.object({
  plateNumber: z.string().min(3).max(12),
  vehicleType: z.enum(['car', 'motorcycle']),
  gateInId: z.string().min(1),
});
const exitSchema = z.object({
  ticketCode: z.string().min(1),
  gateOutId: z.string().min(1),
  lostTicket: z.boolean().optional(),
});

// Kendaraan masuk: ambil slot secara atomik, buat sesi + tiket
router.post('/entry', gateStaff, validate(entrySchema), async (req, res, next) => {
  try {
    const { plateNumber, vehicleType, gateInId } = req.body;

    const dup = await ParkingSession.findOne({
      plateNumber: plateNumber.toUpperCase(),
      status: { $in: ['active', 'paid'] },
    });
    if (dup) return res.status(409).json({ message: 'Kendaraan ini masih tercatat di dalam area parkir' });

    const slot = await Slot.findOneAndUpdate(
      { vehicleType, status: 'available' },
      { status: 'occupied' },
      { new: true, sort: { floor: 1, zone: 1, slotNumber: 1 } }
    );
    if (!slot) return res.status(409).json({ message: 'Parkir penuh' });

    const session = await ParkingSession.create({
      ticketCode: generateTicketCode(),
      plateNumber,
      vehicleType,
      gateInId,
      slotId: slot._id,
    });

    res.status(201).json({
      ticketCode: session.ticketCode,
      entryTime: session.entryTime,
      slot: { floor: slot.floor, zone: slot.zone, slotNumber: slot.slotNumber },
    });
  } catch (err) {
    next(err);
  }
});

// Cek status dan tarif berjalan
router.get('/:ticketCode', authenticate, async (req, res, next) => {
  try {
    const session = await ParkingSession.findOne({ ticketCode: req.params.ticketCode });
    if (!session) return res.status(404).json({ message: 'Tiket tidak ditemukan' });

    let currentFee = session.fee;
    if (session.status === 'active') {
      const tariff = await Tariff.findOne({ vehicleType: session.vehicleType });
      currentFee = calculateFee(session.entryTime, new Date(), tariff);
    }
    res.json({ ...session.toObject(), currentFee });
  } catch (err) {
    next(err);
  }
});

// Keluar: hanya boleh jika tarif nol atau sudah dibayar
router.post('/exit', gateStaff, validate(exitSchema), async (req, res, next) => {
  try {
    const { ticketCode, gateOutId, lostTicket } = req.body;
    const session = await ParkingSession.findOne({ ticketCode });
    if (!session) return res.status(404).json({ message: 'Tiket tidak ditemukan' });
    if (session.status === 'closed') return res.status(409).json({ message: 'Tiket sudah dipakai keluar' });

    if (session.status === 'active') {
      const tariff = await Tariff.findOne({ vehicleType: session.vehicleType });
      const fee = calculateFee(session.entryTime, new Date(), tariff, { lostTicket });
      if (fee > 0) {
        return res.status(402).json({ message: 'Pembayaran diperlukan', fee });
      }
    }

    session.status = 'closed';
    session.exitTime = new Date();
    session.gateOutId = gateOutId;
    await session.save();
    await Slot.updateOne({ _id: session.slotId }, { status: 'available' });

    res.json({ message: 'Palang dibuka', ticketCode, exitTime: session.exitTime });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
