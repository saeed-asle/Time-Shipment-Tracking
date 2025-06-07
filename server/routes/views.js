const { nanoid } = require('nanoid');
const axios = require('axios');
require('dotenv').config();

const { readFile, writeFile } = require('./helpers');

const LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY;
const YOUR_GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;


module.exports = {
  /**
 * create_package - Create new package for company with address check and geolocation.
 * @param {object} req - Express request, expects companyid param and package data in body.
 * @param {object} res - Express response, sends status and json message.
 * @returns {void}
 *
 * Checks that ETA >= start_date (both timestamps).
 * Checks address is in Israel using LocationIQ API.
 * Saves package with geo location to file.
 */
create_package: async (req, res) => {
  const companyId = parseInt(req.params.companyid);
  const packageData = { ...req.body, companyId };

  if (packageData.eta < packageData.start_date) { // check ETA not smaller than start date
    return res.status(400).json({ error: 'ETA must be greater than or equal to the start date.' });
  }
  const { street, number, city } = packageData.customer.address;
  const fullAddress = `${street} ${number}, ${city}`;

    try { // call LocationIQ to get latitude and longitude of address
      const locRes = await axios.get('https://us1.locationiq.com/v1/search', {
        params: {
          key: LOCATIONIQ_API_KEY,
          q: fullAddress,
          format: 'json',
          addressdetails: 1
        }
      });

      const { lat, lon, address } = locRes.data[0];
    // check address is in Israel (country_code === 'il')
      if (!address || address.country_code.toLowerCase() !== 'il') {
        return res.status(400).json({ error: 'Address must be located in Israel.' });
      }
    packageData.customer.address.lat = parseFloat(lat);
    packageData.customer.address.lon = parseFloat(lon);
  } catch (err) {
    return res.status(500).json({ error: 'Address location conversion failed.' });
  }

  const newId = nanoid(10);
  const finalPackageData = {
    id: newId,
    name: packageData.name,
    prod_id: packageData.prod_id,
    customer: packageData.customer,
    start_date: packageData.start_date,
    eta: packageData.eta,
    status: packageData.status.trim(),
    path: packageData.path || []
  };
  // read existing data, add new package, sort by start_date desc, save file
  readFile((data) => {
    if (!data[companyId]) data[companyId] = [];

    data[companyId].push({ [newId]: finalPackageData });
    // sort packages newest start_date first

    data[companyId].sort((a, b) => {
      const pkgA = Object.values(a)[0];
      const pkgB = Object.values(b)[0];
      return pkgB.start_date - pkgA.start_date;
    });

    writeFile(JSON.stringify(data, null, 2), () => {
      res.status(201).json({ message: 'Package created', id: newId });
    });
  }, true);
},

/**
 * update_package - Update package fields like ETA and status.
 * @param {object} req - Express request with companyid and packageid params, and update data in body.
 * @param {object} res - Express response to send status and messages.
 * @returns {void}
 *
 * Checks updated ETA >= existing start_date.
 * Writes updated ETA or Status or both to file.
 */
update_package: async (req, res) => {
  const { companyid, packageid } = req.params;
  const updateFields = req.body;

  readFile((data) => {
    const companyPackages = data[companyid];
    if (!companyPackages) return res.status(404).json({ error: 'Company not found' });

    const pkgObj = companyPackages.find(pkg => pkg[packageid]);
    if (!pkgObj) return res.status(404).json({ error: 'Package not found' });

    const pkg = pkgObj[packageid];

    if (updateFields.eta < pkg.start_date) {    // ccheck ETA not smaller than start_date
      return res.status(400).json({ error: 'ETA must be greater than or equal to the start date.' });
    }

    if (updateFields.eta ) pkg.eta = updateFields.eta;
    if (updateFields.status ) pkg.status = updateFields.status;

    writeFile(JSON.stringify(data, null, 2), () => {
      res.status(200).json({ message: 'Package updated successfully' });
    });
  }, true);
},

/**
 * getPackages - Get all packages for company sorted by start_date descending.
 * @param {object} req - Express request with companyid param.
 * @param {object} res - Express response with json array of packages.
 * @returns {void}
 */
getPackages: async (req, res) => {
  const { companyid } = req.params;

  readFile((data) => {
    const companyPackages = data[companyid] || [];
    const sortedPackages = companyPackages.sort((a, b) => {    // sort by start_date descending
      const aPkg = a[Object.keys(a)[0]];
      const bPkg = b[Object.keys(b)[0]];
      return bPkg.start_date - aPkg.start_date;
    });

    res.status(200).json(sortedPackages);// return with the sorted Data
  }, true);
},

/**
 * getPackage - Get one package by companyid and packageid.
 * @param {object} req - Express request with companyid and packageid params.
 * @param {object} res - Express response with package json or error.
 * @returns {void}
 */
getPackage: async (req, res) => {
  const { companyid, packageid } = req.params;

  readFile((data) => {
    const companyPackages = data[companyid];
    if (!companyPackages) return res.status(404).json({ error: 'Company not found' });

    const pkgObj = companyPackages.find(pkg => pkg[packageid]);
    if (!pkgObj) return res.status(404).json({ error: 'Package not found' });

    res.status(200).json(pkgObj); 
  }, true);
},


/**
 * AddLocationToPackage - Add lat/lon location to package path.
 * @param {object} req - Express request with companyid, packageid and lat/lon in body.
 * @param {object} res - Express response with success or error.
 * @returns {void}
 *
 * checks company and package exists.
 * checks if location already in path to avoid duplicates.
 * adds new location to path array.
 */
AddLocationToPackage: async (req, res) => {
  const { companyid, packageid } = req.params;
  const { lat, lon } = req.body;

  readFile((data) => {
    const companyPackages = data[companyid];
    if (!companyPackages) return res.status(404).json({ error: 'Company not found' });

    const pkg = companyPackages.find(pkg => pkg[packageid]);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });

    if (!pkg[packageid].path) pkg[packageid].path = [];
    // check if location already exist in path
    const alreadyExists = pkg[packageid].path.some(loc => loc.lat === lat && loc.lon === lon);
    if (alreadyExists) return res.status(400).json({ error: 'Location already exists in path' });
    // add new location
    pkg[packageid].path.push({ lat, lon });

    writeFile(JSON.stringify(data, null, 2), () => {
      res.status(200).json({ message: 'Location added successfully' });
    });
  }, true);
},

/**
 * SearchLocationForPackage - Search location by string and return lat/lon if in Israel.
 * @param {object} req - Express request with location string in body.
 * @param {object} res - Express response with lat, lon, and address or error.
 * @returns {void}
 *
 * Uses LocationIQ API for geocoding.
 * Checks country code is Israel.
 */
SearchLocationForPackage: async (req, res) => {
  const { location } = req.body;

  if (!location || typeof location !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing location string' });
  }

  try {    // call LocationIQ API for geocode
    const geoRes = await axios.get('https://us1.locationiq.com/v1/search.php', {
      params: {
        key: LOCATIONIQ_API_KEY,
        q: location,
        format: 'json',
        addressdetails: 1
      }
    });
    const result = geoRes.data[0];
    if (!result) return res.status(404).json({ error: 'Location not found' });

    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const countryCode = result.address.country_code;

    if (countryCode.toLowerCase() !== 'il') {    // check location is inside Israel
      return res.status(400).json({ error: 'Location must be within Israel' });
    }

    return res.status(200).json({ lat, lon, address: result.display_name });

  } catch (err) {
    console.error('Search failed:', err.message);
    return res.status(500).json({ error: 'Geocoding failed' });
  }
},
/**
 * getStaticMap - Get static map image of package path with markers.
 * @param {object} req - Express request with companyid and packageid params.
 * @param {object} res - Express response streams static map image or error.
 * @returns {void}
 *
 * Uses Geoapify Static Maps API.
 * Builds bounding box and markers from package path.
 */
getStaticMap: async (req, res) => {
  const { companyid, packageid } = req.params;

  readFile(async (data) => {
    const pkgData = data[companyid]?.find(pkg => pkg[packageid]);
    if (!pkgData) return res.status(404).json({ error: 'Package not found' });

    const path = pkgData[packageid].path;
    if (!path || path.length === 0) {
      return res.status(200).json({ message: 'No path data available' });
    }
    // extract all lat and lon from path
    const lats = path.map(loc => parseFloat(loc.lat));
    const lons = path.map(loc => parseFloat(loc.lon));
    // create bounds for map view (min lon, min lat, max lon, max lat)
    const bounds = `lonlat:${Math.min(...lons)},${Math.min(...lats)},${Math.max(...lons)},${Math.max(...lats)}`;
    // create marker strings for Geoapify map url with index text and style
    const markers = path.map((loc, i) =>
      `lonlat:${loc.lon},${loc.lat};type:material;color:%231f63e6;size:x-large;text:${i + 1};icon:cloud;icontype:awesome;whitecircle:no`
    ).join('|');

    const geoapifyUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&bounds=${bounds}&marker=${markers}&apiKey=${YOUR_GEOAPIFY_API_KEY}`;

    try {// request image stream from Geoapify
      const response = await axios.get(geoapifyUrl, { responseType: 'stream' });
      res.setHeader('Content-Type', response.headers['content-type']);
      response.data.pipe(res);// pipe image to response
    } catch (error) {
      console.error('Error fetching static map:', error);
      res.status(500).json({ error: 'Failed to fetch static map image' });
    }
  }, true);}

};
