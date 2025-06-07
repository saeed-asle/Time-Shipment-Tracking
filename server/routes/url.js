const express = require('express');
const company = require('./views');
const validate = require('../../utils/validate');
const {
  packageSchema,
  updateSchema,
  addLocationSchema,
  paramCompanySchema,
  paramCompanyPackageSchema,
  searchLocationSchema
} = require('../../utils/validator');

const router = express.Router();

/**
 * @route POST /buisness/:companyid/packages
 * @desc Create a new package for a company
 */
router.post(
  '/buisness/:companyid/packages',
  validate(packageSchema, paramCompanySchema),
  company.create_package
);

/**
 * @route PUT /buisness/:companyid/packages/:packageid
 * @desc Update ETA or status of a package
 */
router.put(
  '/buisness/:companyid/packages/:packageid',
  validate(updateSchema, paramCompanyPackageSchema),
  company.update_package
);

/**
 * @route POST /buisness/:companyid/packages/:packageid/path/search
 * @desc Search for a new location to add to a package's path
 */
router.post(
  '/buisness/:companyid/packages/:packageid/path/search',
  validate(searchLocationSchema, null),
  company.SearchLocationForPackage
);

/**
 * @route PUT /buisness/:companyid/packages/:packageid/path
 * @desc Add a location (lat/lon) to a package's delivery path
 */
router.put(
  '/buisness/:companyid/packages/:packageid/path',
  validate(addLocationSchema, paramCompanyPackageSchema),
  company.AddLocationToPackage
);

/**
 * @route GET /buisness/:companyid/packages/:packageid
 * @desc Get a single package by ID
 */
router.get(
  '/buisness/:companyid/packages/:packageid',
  validate(null, paramCompanyPackageSchema),
  company.getPackage
);

/**
 * @route GET /buisness/:companyid/packages
 * @desc Get all packages for a company
 */
router.get(
  '/buisness/:companyid/packages',
  validate(null, paramCompanySchema),
  company.getPackages
);

/**
 * @route GET /buisness/:companyid/packages/:packageid/staticmap
 * @desc Get a static map for the package path
 */
router.get(
  '/buisness/:companyid/packages/:packageid/staticmap',
  validate(null, paramCompanyPackageSchema),
  company.getStaticMap
);

module.exports = router;
