require('dotenv').config();
const bcrypt = require('bcrypt');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Tariff = require('../src/models/Tariff');
const Slot = require('../src/models/Slot');

(async () => {
  await connectDB();

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password && !(await User.findOne({ email }))) {
    await User.create({ name: 'Admin', email, password: await bcrypt.hash(password, 10), role: 'admin' });
    console.log('Admin dibuat:', email);
  }

  // Tarif contoh (WAJIB disesuaikan dengan tarif resmi mal)
  await Tariff.updateOne({ vehicleType: 'car' },
    { firstHourFee: 5000, nextHourFee: 3000, dailyMax: 50000, lostTicketFee: 100000 }, { upsert: true });
  await Tariff.updateOne({ vehicleType: 'motorcycle' },
    { firstHourFee: 2000, nextHourFee: 1000, dailyMax: 15000, lostTicketFee: 50000 }, { upsert: true });

  // Slot contoh: 3 lantai x 20 mobil + 10 motor
  if ((await Slot.countDocuments()) === 0) {
    const slots = [];
    for (const floor of ['B1', 'B2', 'B3']) {
      for (let i = 1; i <= 20; i++) slots.push({ floor, zone: 'A', slotNumber: `C${i}`, vehicleType: 'car' });
      for (let i = 1; i <= 10; i++) slots.push({ floor, zone: 'M', slotNumber: `M${i}`, vehicleType: 'motorcycle' });
    }
    await Slot.insertMany(slots);
    console.log(`${slots.length} slot dibuat`);
  }

  console.log('Seed selesai');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
