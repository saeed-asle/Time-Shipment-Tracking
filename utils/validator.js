const yup = require('yup');

// Package Schema
const packageSchema = yup.object({
  prod_id: yup.string().required(),
  name: yup.string().required(),

  customer: yup.object({
    id: yup.string().required(),
    name: yup.string().required(),
    email: yup.string().email().required(),
    address: yup.object({
      street: yup.string().required(),
      number: yup.number()
        .required()
        .min(1, 'Street number must be a positive number'),
      city: yup.string().required(),
    }).required()
  }).required(),

  start_date: yup.number()
    .typeError('Start date must be a valid timestamp')
    .required('Start date is required'),

  eta: yup.number()
    .typeError('ETA must be a valid timestamp')
    .required('ETA is required'),

  status: yup.string()
    .required()
    .oneOf(["packed", "shipped", "intransit", "delivered"], 'Invalid status'),

  path: yup.array().of(
    yup.object({
      lon: yup.number()
        .required()
        .min(-180)
        .max(180),
      lat: yup.number()
        .required()
        .min(-90)
        .max(90)
    })
  ).optional()
});


// Update Schema
const updateSchema = yup.object({
  eta: yup.number()
    .typeError('ETA must be a valid timestamp')
    .optional(),

  status: yup.string()
    .oneOf(["packed", "shipped", "intransit", "delivered"])
    .optional()
}).test('at-least-one', 'At least one of ETA or status must be provided', function (value) {
  return value.eta != null || value.status != null;
});

// Params
const paramCompanySchema = yup.object({
  companyid: yup.number()
    .required()
    .min(1)
    .max(10)
});

const paramCompanyPackageSchema = yup.object({
  companyid: yup.number()
    .required()
    .min(1)
    .max(10),
  packageid: yup.string().required()
});

// Location Schema
const addLocationSchema = yup.object({
  lat: yup.number()
    .required()
    .min(-90)
    .max(90),
  lon: yup.number()
    .required()
    .min(-180)
    .max(180)
});

module.exports = {
  packageSchema,
  updateSchema,
  paramCompanySchema,
  paramCompanyPackageSchema,
  addLocationSchema
};
