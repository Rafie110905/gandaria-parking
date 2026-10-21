const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    ticketCode: { type: String, required: true, unique: true },
    plateNumber: { type: String, required: true, uppercase: true, trim: true, index: true },
    vehicleType: { type: String, enum: ['car', 'motorcycle'], required: true },
    gateInId: { type: String, required: true },
    gateOutId: { type: String },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' },
    entryTime: { type: Date, default: Date.now },
    exitTime: { type: Date },
    status: { type: String, enum: ['active', 'paid', 'closed'], default: 'active', index: true },
    fee: { type: Number, default: 0 },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ParkingSession', sessionSchema);
