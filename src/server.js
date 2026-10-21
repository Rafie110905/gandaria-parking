require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

for (const key of ['JWT_SECRET', 'MONGODB_URI', 'PAYMENT_WEBHOOK_SECRET']) {
  if (!process.env[key]) {
    console.error(`Env ${key} belum diset (lihat .env.example)`);
    process.exit(1);
  }
}

const port = process.env.PORT || 3000;

connectDB()
  .then(() => app.listen(port, () => console.log(`Server berjalan di http://localhost:${port}`)))
  .catch((err) => {
    console.error('Gagal start:', err);
    process.exit(1);
  });
