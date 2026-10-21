// Validasi body dengan skema zod
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Input tidak valid', errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  next();
};

module.exports = validate;
