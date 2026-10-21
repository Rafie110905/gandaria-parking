const express = require('express');
const Slot = require('../models/Slot');

const router = express.Router();

// Publik: untuk papan informasi dan aplikasi
router.get('/availability', async (req, res, next) => {
  try {
    const data = await Slot.aggregate([
      {
        $group: {
          _id: { floor: '$floor', vehicleType: '$vehicleType' },
          total: { $sum: 1 },
          available: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.floor': 1 } },
      {
        $project: { _id: 0, floor: '$_id.floor', vehicleType: '$_id.vehicleType', total: 1, available: 1 },
      },
    ]);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
