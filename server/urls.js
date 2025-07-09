const express = require('express');
const buisnesCtrl = require('./views/buisnes');
const customerCtrl = require('./views/customer');
const packageCtrl = require('./views/package');
const validate = require('../utils/validate');
const { companySchema, customerSchema, packageSchema, objectIdSchema } = require('../utils/validator');
const router = express.Router();

router.post('/buisness', buisnesCtrl.createBuisnes);
router.get('/buisness', buisnesCtrl.getBuisnes);

router.post('/customers', customerCtrl.createCustomer);
router.get('/customers', customerCtrl.getCustomers);

router.post('/packages',

  packageCtrl.createPackage
);
router.get('/packages/:packageid/staticmap', packageCtrl.getStaticMap);

router.get('/packages/:buisnessid', packageCtrl.getPackages);
router.put('/packages/:packageid/path', packageCtrl.addLocationToPackage);
router.post('/location/search', packageCtrl.searchLocation);

module.exports = router;
