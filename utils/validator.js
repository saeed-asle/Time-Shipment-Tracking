const yup = require('yup');

const objectIdSchema = yup.string()
  .required('ID is required')
  .matches(/^[a-f\d]{24}$/, 'Must be a valid MongoDB ObjectId');

const companySchema = yup.object({
  name: yup.string()
    .required('Company name is required')
    .min(2)
    .max(100)
    .matches(/^[\u0590-\u05FF\w\s.,'-]{2,}$/, 'Invalid characters in company name'),
  site_url: yup.string()
    .required('Company site URL is required')
    .url('Invalid URL format')
}).noUnknown();

const customerSchema = yup.object({
  name: yup.string()
    .required('Customer name is required')
    .min(2)
    .max(100),
  email: yup.string()
    .required('Email is required')
    .email('Invalid email format'),
  address: yup.object({
    street: yup.string().required('Street is required'),
    number: yup.number().required('Number is required'),
    city: yup.string().required('City is required')
  }).required()
}).noUnknown();

const packageSchema = yup.object({
  prod_id: yup.string()
    .required('Product ID is required'),
  name: yup.string()
    .required('Package name is required'),
  start_date: yup.number()
    .required('Start date is required')
    .typeError('Start date must be a timestamp'),
  eta: yup.number()
    .required('ETA is required')
    .typeError('ETA must be a timestamp'),
  status: yup.string()
    .required()
    .oneOf(['packed', 'shipped', 'intransit', 'delivered'], 'Invalid status'),
  buisness_id: objectIdSchema.label('Business ID'),
  customer_id: objectIdSchema.label('Customer ID'),
  path: yup.array().of(
    yup.object({
      lat: yup.number().required().min(-90).max(90),
      lon: yup.number().required().min(-180).max(180)
    })
  ).optional()
}).noUnknown();

const addLocationSchema = yup.object({
  lat: yup.number()
    .required('Latitude is required')
    .min(-90)
    .max(90),
  lon: yup.number()
    .required('Longitude is required')
    .min(-180)
    .max(180)
}).noUnknown();

const searchLocationSchema = yup.object({
  location: yup.string()
    .required('Location string is required')
    .matches(/^[A-Za-z\s.,'-]*$/, 'Location must contain only English letters')
}).noUnknown();

const paramPackageId = yup.object({
  packageid: objectIdSchema.label('Package ID')
}).noUnknown();

const paramBusinessId = yup.object({
  buisnessid: objectIdSchema.label('Business ID')
}).noUnknown();

const paramBusinessPackage = yup.object({
  buisnessid: objectIdSchema.label('Business ID'),
  packageid: objectIdSchema.label('Package ID')
}).noUnknown();

module.exports = {
  companySchema,
  customerSchema,
  packageSchema,
  addLocationSchema,
  searchLocationSchema,
  paramPackageId,
  paramBusinessId,
  paramBusinessPackage,
  objectIdSchema
};
