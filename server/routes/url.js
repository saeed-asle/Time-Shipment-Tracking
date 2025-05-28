const express = require('express');
const company = require('./views');

const router = express.Router();
router.get('/company/:companyid', company.getPackages );
router.post('/company/:companyid/package', company.create_package);
router.get('/company/:companyid/package/:packageid', company.getPackage);
router.put('/company/:companyid/package/:packageid', company.update_package);
router.put('/company/:companyid/package/:packageid/location', company.AddLocationToPackage );

module.exports = router;