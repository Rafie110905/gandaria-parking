const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.use(helmet());
// Simpan raw body untuk verifikasi signature webhook
app.use(express.json({ limit: '100kb', verify: (req, res, buf) => { req.rawBody = buf; } }));

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/slots', require('./routes/slots'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/tariffs', require('./routes/tariffs'));
app.use('/api/reports', require('./routes/reports'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
