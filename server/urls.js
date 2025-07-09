const express = require('express');
const companyCtrl = require('./views/company');
const customerCtrl = require('./views/customer');
const packageCtrl = require('./views/package');
const validate = require('../utils/validate');
const { companySchema, customerSchema, packageSchema, objectIdSchema } = require('../utils/validator');
const router = express.Router();

router.post('/companies', validate(companySchema), companyCtrl.createCompany);
router.get('/companies', companyCtrl.getCompanies);

router.post('/customers', validate(customerSchema), customerCtrl.createCustomer);
router.get('/customers', customerCtrl.getCustomers);

router.post('/companies/:companyid/packages',
validate(packageSchema, objectIdSchema),
  packageCtrl.createPackage
);
router.get('/packages/:packageid/staticmap', packageCtrl.getStaticMap);

router.get('/companies/:companyid/packages', packageCtrl.getPackages);
router.put('/packages/:packageid/path', packageCtrl.addLocationToPackage);
router.post('/location/search', packageCtrl.searchLocation);

module.exports = router;
