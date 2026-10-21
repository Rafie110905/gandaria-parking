const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  floor: { type: String, required: true },
  zone: { type: String, required: true },
  slotNumber: { type: String, required: true },
  vehicleType: { type: String, enum: ['car', 'motorcycle'], required: true },
  status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
});

slotSchema.index({ floor: 1, zone: 1, slotNumber: 1 }, { unique: true });
slotSchema.index({ vehicleType: 1, status: 1 });

module.exports = mongoose.model('Slot', slotSchema);
