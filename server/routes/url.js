const express = require('express');
const company = require('./views');

const router = express.Router();

router.get('/buisness/:companyid/packages', company.getPackages);
router.post('/buisness/:companyid/packages', company.create_package);
router.get('/buisness/:companyid/packages/:packageid', company.getPackage);
router.put('/buisness/:companyid/packages/:packageid', company.update_package);
router.put('/buisness/:companyid/packages/:packageid/path', company.AddLocationToPackage);

module.exports = router;
