/**
 * Hitung tarif parkir. Pembulatan ke atas per jam, minimal 1 jam.
 * Tarif harian maksimum berlaku per 24 jam.
 */
function calculateFee(entryTime, exitTime, tariff, { lostTicket = false } = {}) {
  if (lostTicket) return tariff.lostTicketFee;

  const ms = new Date(exitTime) - new Date(entryTime);
  if (ms < 0) throw new Error('exitTime lebih awal dari entryTime');

  const totalHours = Math.max(1, Math.ceil(ms / 36e5));
  const fullDays = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;

  const partial =
    remainingHours === 0
      ? 0
      : Math.min(tariff.firstHourFee + (remainingHours - 1) * tariff.nextHourFee, tariff.dailyMax);

  return fullDays * tariff.dailyMax + partial;
}

module.exports = { calculateFee };
