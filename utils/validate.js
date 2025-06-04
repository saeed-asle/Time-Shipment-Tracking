module.exports = (bodySchema = null, paramSchema = null) => async (req, res, next) => {
  try {
    if (paramSchema) {
      req.params = await paramSchema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true
      });
    }

    if (bodySchema) {
      req.body = await bodySchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });
    }

    next();
  } catch (err) {
    res.status(400).json({ error: err.errors.join(', ') });
  }
};
