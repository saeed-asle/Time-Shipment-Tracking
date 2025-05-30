const yup = require('yup');

const isToday = (date) => {
  const today = new Date();
  return date.getFullYear() === today.getFullYear() &&
         date.getMonth() === today.getMonth() &&
         date.getDate() === today.getDate();
};

const packageSchema = yup.object({
  prod_id: yup.string().required(),

  customer: yup.object({
    id: yup.string().required(),
    name: yup.string().required(),
    email: yup.string().email().required(),
    address: yup.object({
      street: yup.string().required(),
      number: yup.number().required(),
      city: yup.string().required(),
    }).required()
  }).required(),

  start_date: yup.date()
    .nullable()
    .transform((value, originalValue) => {
      return originalValue === '' || originalValue === undefined || originalValue === null
        ? new Date() 
        : new Date(originalValue);
    })
    // .test('is-today', 'Start date must be today', function (value) {
    //   return isToday(value);
    // }),
,
  eta: yup.date()
    .required()
    // .test('eta-after-start', 'ETA must be equal to or after start date', function (value) {
    //   const { start_date } = this.parent;
    //   const start = start_date || new Date(); 
    //   return value >= start;
    // }),
,
  status: yup.string().oneOf(["packed", "shipped", "intransit", "delivered"]).required(),

  path: yup.array().of(
    yup.object({
      lon: yup.number().required(),
      lat: yup.number().required()
    })
  ).default([])
});


const updateSchema = yup.object({
  eta: yup.date().required(),
  status: yup.string().oneOf(["packed", "shipped", "intransit", "delivered"]).optional()
});

const paramCompanySchema = yup.object({
  companyid: yup.number().min(1).max(10).required()
});

const paramCompanyPackageSchema = yup.object({
  companyid: yup.number().min(1).max(10).required(),
  packageid: yup.string().required()
});

const addLocationSchema = yup.object({
    lat: yup.number().required(),
    lon: yup.number().required()
});

module.exports = {
  packageSchema,
  updateSchema,
  paramCompanySchema,
  paramCompanyPackageSchema,
  addLocationSchema
};
