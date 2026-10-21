const mongoose = require('mongoose');

const tariffSchema = new mongoose.Schema(
  {
    vehicleType: { type: String, enum: ['car', 'motorcycle'], required: true, unique: true },
    firstHourFee: { type: Number, required: true, min: 0 },
    nextHourFee: { type: Number, required: true, min: 0 },
    dailyMax: { type: Number, required: true, min: 0 },
    lostTicketFee: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tariff', tariffSchema);
