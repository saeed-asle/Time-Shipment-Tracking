const yup = require('yup'); // bring yup library (for validating data)

// check for a valid MongoDB ObjectId (24 letters/numbers)
const objectIdSchema = yup.string()
  .required('ID is required') // must give
  .matches(/^[a-f\d]{24}$/, 'Must be a valid MongoDB ObjectId'); // must match Mongo ID format

// schema for company (buisnes)
const companySchema = yup.object({
  name: yup.string()
    .required('Company name is required') // must give name
    .min(2) // at least 2 letters
    .max(100) // max 100 letters
    .matches(/^[\u0590-\u05FF\w\s.,'-]{2,}$/, 'Invalid characters in company name'), // allow Hebrew, letters, numbers
  site_url: yup.string()
    .required('Company site URL is required') // must give URL
    .url('Invalid URL format') // must be real URL
}).noUnknown(); // no extra fields allowed

// schema for customer
const customerSchema = yup.object({
  name: yup.string()
    .required('Customer name is required') // must give name
    .min(2)
    .max(100),
  email: yup.string()
    .required('Email is required') // must give email
    .email('Invalid email format'), // must be real email
  address: yup.object({ // address object inside
    street: yup.string().required('Street is required'),
    number: yup.number().required('Number is required'),
    city: yup.string().required('City is required')
  }).required()
}).noUnknown(); // no extra fields

// schema for package
const packageSchema = yup.object({
  prod_id: yup.string()
    .required('Product ID is required'),
  name: yup.string()
    .required('Package name is required'),
  start_date: yup.number()
    .required('Start date is required')
    .typeError('Start date must be a timestamp'), // must be number
  eta: yup.number()
    .required('ETA is required')
    .typeError('ETA must be a timestamp'),
  status: yup.string()
    .required()
    .oneOf(['packed', 'shipped', 'intransit', 'delivered'], 'Invalid status'), // only these allowed
  buisness_id: objectIdSchema.label('Business ID'), // must be valid Mongo ID
  customer_id: objectIdSchema.label('Customer ID'), // must be valid Mongo ID
  path: yup.array().of( // list of locations (optional)
    yup.object({
      lat: yup.number().required().min(-90).max(90),
      lon: yup.number().required().min(-180).max(180)
    })
  ).optional()
}).noUnknown();

// schema to add one location
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

// schema to search by location name
const searchLocationSchema = yup.object({
  location: yup.string()
    .required('Location string is required')
    .matches(/^[A-Za-z\s.,'-]*$/, 'Location must contain only English letters') // only English allowed
}).noUnknown();

// schema for package id in URL
const paramPackageId = yup.object({
  packageid: objectIdSchema.label('Package ID')
}).noUnknown();

// schema for business id in URL
const paramBusinessId = yup.object({
  buisnessid: objectIdSchema.label('Business ID')
}).noUnknown();

// schema for both business and package id in URL
const paramBusinessPackage = yup.object({
  buisnessid: objectIdSchema.label('Business ID'),
  packageid: objectIdSchema.label('Package ID')
}).noUnknown();

// export all schemas to use in other files
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
