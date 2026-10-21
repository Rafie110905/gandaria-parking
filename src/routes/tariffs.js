const express = require('express');
const { z } = require('zod');
const Tariff = require('../models/Tariff');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();
router.use(authenticate, authorize('admin'));

const tariffSchema = z.object({
  vehicleType: z.enum(['car', 'motorcycle']),
  firstHourFee: z.number().min(0),
  nextHourFee: z.number().min(0),
  dailyMax: z.number().min(0),
  lostTicketFee: z.number().min(0),
});

router.get('/', async (req, res, next) => {
  try {
    res.json(await Tariff.find());
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(tariffSchema), async (req, res, next) => {
  try {
    res.status(201).json(await Tariff.create(req.body));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validate(tariffSchema), async (req, res, next) => {
  try {
    const t = await Tariff.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!t) return res.status(404).json({ message: 'Tarif tidak ditemukan' });
    res.json(t);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const t = await Tariff.findByIdAndDelete(req.params.id);
    if (!t) return res.status(404).json({ message: 'Tarif tidak ditemukan' });
    res.json({ message: 'Tarif dihapus' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
