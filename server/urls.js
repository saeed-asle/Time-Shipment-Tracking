const express = require('express'); // bring express library
const yup = require('yup'); // bring yup for validation

// bring the controller files (logic for routes)
const buisnesCtrl = require('./views/buisnes');
const customerCtrl = require('./views/customer');
const packageCtrl = require('./views/package');

// bring validation middleware
const validate = require('../utils/validate');

// bring all schemas from validator file
const {
  companySchema,
  customerSchema,
  packageSchema,
  addLocationSchema,
  searchLocationSchema,
  paramPackageId,
  paramBusinessId
} = require('../utils/validator');

const router = express.Router(); // create router

// ------ Business (Company) Routes ------

// create new business
router.post('/buisness', validate(companySchema), buisnesCtrl.createBuisnes);

// get list of all businesses
router.get('/buisness', buisnesCtrl.getBuisnes);

// ------ Customer Routes ------

// create new customer
router.post('/customers', validate(customerSchema), customerCtrl.createCustomer);

// get all customers
router.get('/customers', customerCtrl.getCustomers);

// ------ Package Routes ------

// create a new package
router.post('/packages', validate(packageSchema), packageCtrl.createPackage);

// get all packages for a business (use business ID from URL)
router.get('/packages/:buisnessid', validate(null, paramBusinessId), packageCtrl.getPackages);

// get static map for one package (by package ID)
router.get('/packages/:packageid/staticmap', validate(null, paramPackageId), packageCtrl.getStaticMap);

// add new location to package path
router.put(
  '/packages/:packageid/path',
  validate(addLocationSchema, paramPackageId), // validate body and URL param
  packageCtrl.addLocationToPackage
);

// search by text (location name)
router.post('/location/search', validate(searchLocationSchema), packageCtrl.searchLocation);

// export all routes to use in app.js
module.exports = router;
