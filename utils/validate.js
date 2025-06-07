/**
 * Middleware to validate request body, params, and/or query using Yup schemas
 * @param {yup.ObjectSchema} bodySchema - Schema to validate req.body
 * @param {yup.ObjectSchema} paramSchema - Schema to validate req.params
 * @param {yup.ObjectSchema} querySchema - Schema to validate req.query
 */
module.exports = (bodySchema = null, paramSchema = null, querySchema = null) => async (req, res, next) => {
  try {
    // Validate route parameters
    if (paramSchema) {
      req.params = await paramSchema.validate(req.params, {
        strict: true,
        abortEarly: false
      });
    }

    // Validate query parameters
    if (querySchema) {
      req.query = await querySchema.validate(req.query, {
        strict: true,
        abortEarly: false
      });
    }

    // Validate request body
    if (bodySchema) {
      req.body = await bodySchema.validate(req.body, {
        strict: true,
        abortEarly: false
      });
    }

    next();
  } catch (err) {
    // Return all validation errors
    res.status(400).json({ error: err.errors.join(', ') });
  }
};
