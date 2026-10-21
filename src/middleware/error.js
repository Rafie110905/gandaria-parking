function notFound(req, res) {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === 11000) return res.status(409).json({ message: 'Data duplikat' });
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Terjadi kesalahan server' });
}

module.exports = { notFound, errorHandler };
