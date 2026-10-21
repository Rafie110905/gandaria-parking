const test = require('node:test');
const assert = require('node:assert');
const { calculateFee } = require('../src/utils/fee');

const tariff = { firstHourFee: 5000, nextHourFee: 3000, dailyMax: 50000, lostTicketFee: 100000 };
const t0 = new Date('2026-01-01T08:00:00Z');
const plus = (h, m = 0) => new Date(t0.getTime() + (h * 60 + m) * 60000);

test('minimal 1 jam', () => assert.strictEqual(calculateFee(t0, plus(0, 5), tariff), 5000));
test('1 jam 1 menit dihitung 2 jam', () => assert.strictEqual(calculateFee(t0, plus(1, 1), tariff), 8000));
test('dibatasi dailyMax', () => assert.strictEqual(calculateFee(t0, plus(20), tariff), 50000));
test('lebih dari 24 jam', () => assert.strictEqual(calculateFee(t0, plus(26), tariff), 50000 + 8000));
test('tiket hilang', () => assert.strictEqual(calculateFee(t0, plus(1), tariff, { lostTicket: true }), 100000));
test('waktu keluar < masuk', () => assert.throws(() => calculateFee(plus(1), t0, tariff)));
