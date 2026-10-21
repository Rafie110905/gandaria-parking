const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');
const validate = require('../middleware/validate');

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

// Registrasi publik: role selalu 'customer'. Operator/admin dibuat lewat seed atau admin.
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    await User.create({ ...req.body, password: hash, role: 'customer' });
    res.status(201).json({ message: 'User terdaftar' });
  } catch (err) {
    next(err);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+password');
    const ok = user && (await bcrypt.compare(req.body.password, user.password));
    if (!ok) return res.status(401).json({ message: 'Email atau password salah' });

    const accessToken = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
