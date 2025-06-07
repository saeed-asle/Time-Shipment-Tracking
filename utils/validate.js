module.exports = (bodySchema = null, paramSchema = null, querySchema = null) => async (req, res, next) => {
  try {
    if (paramSchema) {
      req.params = await paramSchema.validate(req.params, {
        strict: true,
        abortEarly: false
      });
    }

    if (querySchema) {
      req.query = await querySchema.validate(req.query, {
        strict: true,
        abortEarly: false
      });
    }

    if (bodySchema) {
      req.body = await bodySchema.validate(req.body, {
        strict: true,
        abortEarly: false
      });
    }

    next();
  } catch (err) {
    res.status(400).json({ error: err.errors.join(', ') });
  }
};
