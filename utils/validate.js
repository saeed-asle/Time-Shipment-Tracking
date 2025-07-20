// export a function that checks body, params, and query using schemas
module.exports = (bodySchema = null, paramSchema = null, querySchema = null) => 
  async (req, res, next) => {
    try {
      // if param schema is given, validate URL params (like /:id)
      if (paramSchema) {
        req.params = await paramSchema.validate(req.params, {
          strict: true,         // don't try to fix data automatically
          abortEarly: false     // collect all errors, not just first one
        });
      }

      // if query schema is given, validate query string (like ?name=abc)
      if (querySchema) {
        req.query = await querySchema.validate(req.query, {
          strict: true,
          abortEarly: false
        });
      }

      // if body schema is given, validate the body data (like POST or PUT)
      if (bodySchema) {
        req.body = await bodySchema.validate(req.body, {
          strict: true,
          abortEarly: false
        });
      }

      next(); // all OK, go to next middleware or route
    } catch (err) {
      // if error found, return 400 and show error messages
      res.status(400).json({ error: err.errors.join(', ') });
    }
};
