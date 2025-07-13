const express = require('express');
const yup = require('yup');

const buisnesCtrl = require('./views/buisnes');
const customerCtrl = require('./views/customer');
const packageCtrl = require('./views/package');
const validate = require('../utils/validate');

const {
  companySchema,
  customerSchema,
  packageSchema,
  addLocationSchema,
  searchLocationSchema,
  paramPackageId,
  paramBusinessId
} = require('../utils/validator');

const router = express.Router();

router.post('/buisness', validate(companySchema), buisnesCtrl.createBuisnes);
router.get('/buisness', buisnesCtrl.getBuisnes);

router.post('/customers', validate(customerSchema), customerCtrl.createCustomer);
router.get('/customers', customerCtrl.getCustomers);

router.post('/packages', validate(packageSchema), packageCtrl.createPackage);
router.get('/packages/:buisnessid', validate(null, paramBusinessId), packageCtrl.getPackages);
router.get('/packages/:packageid/staticmap', validate(null, paramPackageId), packageCtrl.getStaticMap);

router.put(
  '/packages/:packageid/path',
  validate(addLocationSchema, paramPackageId),
  packageCtrl.addLocationToPackage
);

router.post('/location/search', validate(searchLocationSchema), packageCtrl.searchLocation);

module.exports = router;
