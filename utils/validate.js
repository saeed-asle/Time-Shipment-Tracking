module.exports = (bodySchema = null, paramSchema = null) => async (req, res, next) => {
  try {
    if (paramSchema) {
      await paramSchema.validate(req.params, { abortEarly: false });
    }

    if (bodySchema) {
      await bodySchema.validate(req.body, { abortEarly: false });
    }

    next();
  } catch (err) {
    res.status(400).json({ error: err.errors.join(', ') });
  }
};
