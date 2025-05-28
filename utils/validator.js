const yup = require('yup');

const packageSchema = yup.object({
  companyId: yup.number().min(1).max(10).required(), 
  prod_id: yup.string().required(),
  customer: yup.object({
    id: yup.string().required(),
    name: yup.string().required(),
    email: yup.string().email().required(),
    address: yup.object({
      street: yup.string().required(),
      number: yup.number().required(),
      apartment: yup.string().required(),
      city: yup.string().required(),
    }).required()
  }).required(),
  start_date: yup.date().required(),
  eta: yup.date().required(),
  status: yup.string().oneOf(["packed", "shipped", "intransit", "delivered"]).required(),
  path: yup.array().of(
    yup.object({
      lon: yup.number().required(),
      lat: yup.number().required()
    })
  ).default([])
});

module.exports = {
  validatePackage: async (data) => {
    try {
      await packageSchema.validate(data, { abortEarly: false });
      return { valid: true };
    } catch (err) {
      return {
        valid: false,
        error: err.errors.join(', ')
      };
    }
  }
};
