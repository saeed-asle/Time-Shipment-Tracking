const yup = require('yup');

// Company ID: integer between 1–10
const companyIdSchema = yup
  .mixed()
  .required('companyid is required')
  .test('is-valid-companyid', 'companyid must be an integer between 1 and 10', function (value) {
    const num = Number(value);
    return Number.isInteger(num) && num >= 1 && num <= 10;
  });

/**
 * Full package schema for creation
 */
const packageSchema = yup.object({
  id: yup.string().optional(),
  prod_id: yup.string().required(),
  name: yup.string()
    .required()
    .matches(/^[A-Za-z\s.,'-]*$/, 'Name must contain only English letters'),

  customer: yup
    .string()
    .required('Customer is required')
    .matches(/^[a-fA-F0-9]{24}$/, 'Customer must be a valid ObjectId'),

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

/**
 * Partial package update: ETA or status (at least one)
 */
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
  value => value.eta != null || value.status != null
);

/**
 * Params: only companyid
 */
const paramCompanySchema = yup.object({
  companyid: companyIdSchema
}).noUnknown();

/**
 * Params: companyid + packageid
 */
const paramCompanyPackageSchema = yup.object({
  companyid: companyIdSchema,
  packageid: yup.string().required()
}).noUnknown();

/**
 * Add a location (lat/lon)
 */
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

/**
 * Search location by name string
 */
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
