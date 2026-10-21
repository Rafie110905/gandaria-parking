const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSession', required: true },
    orderId: { type: String, required: true, unique: true }, // dikirim ke payment gateway
    method: { type: String, enum: ['qris', 'ewallet', 'card', 'cash'], required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
