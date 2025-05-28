const express = require('express');
const company = require('./views');

const router = express.Router();

router.post('/company/:companyid/package', company.create_package);
router.put('/company/:companyid/package/:packageid', company.update_package);

module.exports = router;