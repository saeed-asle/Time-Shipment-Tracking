const express = require('express');
const company = require('./views');

const router = express.Router();

router.post('/company/:companyid/package', company.create_pachage);

module.exports = router;