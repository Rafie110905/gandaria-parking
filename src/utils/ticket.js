const crypto = require('crypto');

// Kode tiket acak, tidak bisa ditebak (cocok untuk isi QR code)
function generateTicketCode() {
  return 'GC-' + crypto.randomBytes(6).toString('hex').toUpperCase();
}

module.exports = { generateTicketCode };
