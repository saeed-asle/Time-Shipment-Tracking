const express = require('express');
const company = require('./views');
const validate = require('../../utils/validate');
const {
  packageSchema,
  updateSchema,
  addLocationSchema,
  paramCompanySchema,
  paramCompanyPackageSchema
} = require('../../utils/validator');


const router = express.Router();


router.post('/buisness/:companyid/packages',
validate(packageSchema, paramCompanySchema),
  company.create_package
);

router.put(
  '/buisness/:companyid/packages/:packageid',
  validate(updateSchema, paramCompanyPackageSchema),
  company.update_package
);
router.post(
  '/buisness/:companyid/packages/:packageid/path/search',
  company.SearchLocationForPackage
);

router.put(
  '/buisness/:companyid/packages/:packageid/path',
  validate(addLocationSchema, paramCompanyPackageSchema),
  company.AddLocationToPackage
);

router.get(
  '/buisness/:companyid/packages/:packageid',
  validate(null, paramCompanyPackageSchema),
  company.getPackage
);

router.get(
  '/buisness/:companyid/packages',
  validate(null, paramCompanySchema),
  company.getPackages
);

router.get(
  '/buisness/:companyid/packages/:packageid/staticmap',
  validate(null, paramCompanyPackageSchema),
  company.getStaticMap
);


module.exports = router;
