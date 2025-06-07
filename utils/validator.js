const yup = require('yup');

const companyIdSchema = yup
  .mixed()
  .required('companyid is required')
  .test('is-valid-companyid', 'companyid must be an integer between 1 and 10', function (value) {
    const num = Number(value);
    return Number.isInteger(num) && num >= 1 && num <= 10;
  });

const packageSchema = yup.object({
  id: yup.string().optional(),

  prod_id: yup.string()
    .required(),

  name: yup.string()
    .required()
    .matches(/^[A-Za-z\s.,'-]*$/, 'Name must contain only English letters'),

  customer: yup.object({
    id: yup.string().required(),

    name: yup.string()
      .required()
      .matches(/^[A-Za-z\s.,'-]*$/, 'Customer name must contain only English letters'),

    email: yup.string().email().required(),

    address: yup.object({
      street: yup.string()
        .required()
        .matches(/^[A-Za-z0-9\s.,'-]*$/, 'Street must contain only English characters'),

      number: yup.number()
        .required()
        .min(1, 'Street number must be a positive number'),

      city: yup.string()
        .required()
        .matches(/^[A-Za-z\s.,'-]*$/, 'City must contain only English letters'),

      lat: yup.number()
        .min(-90)
        .max(90)
        .optional()
        .typeError('Latitude must be a valid number'),

      lon: yup.number()
        .min(-180)
        .max(180)
        .optional()
        .typeError('Longitude must be a valid number')
    }).required().noUnknown()
  }).required().noUnknown(),

  start_date: yup.number()
    .strict(true)
    .typeError('Start date must be a valid timestamp')
    .required('Start date is required'),

  eta: yup.number()
    .strict(true)
    .typeError('ETA must be a valid timestamp')
    .required('ETA is required'),

  status: yup.string()
    .required()
    .oneOf(["packed", "shipped", "intransit", "delivered"], 'Invalid status'),

  path: yup.array().of(
    yup.object({
      lon: yup.number().required().min(-180).max(180),
      lat: yup.number().required().min(-90).max(90)
    }).noUnknown()
  ).optional()
}).noUnknown();

const updateSchema = yup.object({
  eta: yup.number()
    .strict(true)
    .typeError('ETA must be a valid timestamp')
    .optional(),

  status: yup.string()
    .oneOf(["packed", "shipped", "intransit", "delivered"])
    .optional()
}).noUnknown().test(
  'at-least-one',
  'At least one of ETA or status must be provided',
  function (value) {
    return value.eta != null || value.status != null;
  }
);

const paramCompanySchema = yup.object({
  companyid: companyIdSchema
}).noUnknown();

const paramCompanyPackageSchema = yup.object({
  companyid: companyIdSchema,
  packageid: yup.string().required()
}).noUnknown();

const addLocationSchema = yup.object({
  lat: yup.number()
    .required()
    .min(-90)
    .max(90),
  lon: yup.number()
    .required()
    .min(-180)
    .max(180)
}).noUnknown();

const searchLocationSchema = yup.object({
  location: yup.string()
    .required('Location string is required')
    .matches(/^[A-Za-z\s.,'-]*$/, 'Location must contain only English letters')
}).noUnknown();

module.exports = {
  packageSchema,
  updateSchema,
  paramCompanySchema,
  paramCompanyPackageSchema,
  addLocationSchema,
  searchLocationSchema
};
