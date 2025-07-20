const Package = require('../models/Package'); // get the Package model
const Buisnes = require('../models/Buisnes'); // get the Buisnes model
const Customer = require('../models/Customer'); // get the Customer model
const axios = require('axios'); // for HTTP requests
const LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY; // API key for LocationIQ

// Create a new package
const createPackage = async (req, res) => {
  try {
    // check business ID
    if (!req.body.buisness_id || typeof req.body.buisness_id !== 'string' || req.body.buisness_id.length !== 24) {
      return res.status(400).json({ error: 'Invalid buisness id' });
    }

    const buisness = await Buisnes.findById(req.body.buisness_id);
    if (!buisness) return res.status(404).json({ error: 'Buisness not found' });

    // check customer ID
    const customerId = req.body.customer_id;
    if (!customerId || typeof customerId !== 'string' || customerId.length !== 24) {
      return res.status(400).json({ error: 'Invalid customer id' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    // if customer has no lat/lon, get it from LocationIQ
    if (!customer.address.lat || !customer.address.lon) {
      const { street, number, city } = customer.address;
      const fullAddress = `${street} ${number}, ${city}`;
      const locRes = await axios.get('https://us1.locationiq.com/v1/search', {
        params: {
          key: LOCATIONIQ_API_KEY,
          q: fullAddress,
          format: 'json',
          addressdetails: 1
        }
      });

      const result = locRes.data[0];
      if (!result || result.address.country_code.toLowerCase() !== 'il') {
        return res.status(400).json({ error: 'Address must be located in Israel.' });
      }

      // save lat/lon to customer
      customer.address.lat = parseFloat(result.lat);
      customer.address.lon = parseFloat(result.lon);
      await customer.save();
    }

    // ETA must be after start_date
    if (req.body.eta < req.body.start_date) {
      return res.status(400).json({ error: 'ETA must be after start date.' });
    }

    // make and save new package
    const pkg = new Package({
      prod_id: req.body.prod_id,
      name: req.body.name,
      start_date: req.body.start_date,
      eta: req.body.eta,
      status: req.body.status,
      buisness: buisness._id,
      customer: customer._id,
      path: req.body.path || []
    });

    await pkg.save();
    res.status(201).json({ message: 'Package created', _id: pkg._id });
  } catch (err) {
    res.status(400).json({ error: err.errors || err.message });
  }
};

// Add new location to existing package path
const addLocationToPackage = async (req, res) => {
  try {
    if (!req.params.packageid || typeof req.params.packageid !== 'string' || req.params.packageid.length !== 24) {
      return res.status(400).json({ error: 'Invalid package id' });
    }

    const { lat, lon } = req.body;
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return res.status(400).json({ error: 'lat and lon must be numbers' });
    }

    const pkg = await Package.findById(req.params.packageid);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });

    // check if this location is already in the path
    const exists = pkg.path.some(loc => loc.lat === lat && loc.lon === lon);
    if (exists) return res.status(400).json({ error: 'Location already exists in path' });

    // add new location
    pkg.path.push({ lat, lon });
    await pkg.save();
    res.json({ message: 'Location added successfully' });
  } catch (err) {
    res.status(400).json({ error: err.errors || err.message });
  }
};

// Search for a location using LocationIQ API
const searchLocation = async (req, res) => {
  try {
    const { location } = req.body;
    if (!location || typeof location !== 'string')
      return res.status(400).json({ error: 'location string is required' });

    const locRes = await axios.get('https://us1.locationiq.com/v1/search', {
      params: {
        key: LOCATIONIQ_API_KEY,
        q: location,
        format: 'json',
        addressdetails: 1
      }
    });

    const result = locRes.data[0];
    if (!result) return res.status(404).json({ error: 'Location not found' });

    if (result.address.country_code.toLowerCase() !== 'il') {
      return res.status(400).json({ error: 'Location must be in Israel' });
    }

    res.json({
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      address: result.display_name
    });
  } catch (err) {
    res.status(500).json({ error: 'Geocoding failed' });
  }
};

// Get all packages for one business
const getPackages = async (req, res) => {
  try {
    if (!req.params.buisnessid || typeof req.params.buisnessid !== 'string' || req.params.buisnessid.length !== 24) {
      return res.status(400).json({ error: 'Invalid buisness id' });
    }

    const packages = await Package.find({ buisness: req.params.buisnessid })
      .populate('customer') // show customer info too
      .sort({ start_date: -1 }); // newest first

    res.json(packages);
  } catch (err) {
    res.status(400).json({ error: err.errors || err.message });
  }
};

// Generate static map image with package path
const getStaticMap = async (req, res) => {
  try {
    const { packageid } = req.params;
    if (!packageid || packageid.length !== 24)
      return res.status(400).json({ error: 'Invalid package id' });

    const pkg = await Package.findById(packageid);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });

    const path = pkg.path;
    if (!path || path.length === 0) {
      return res.status(200).json({ message: 'No path data available' });
    }

    // Prepare map bounds and markers
    const lats = path.map(loc => parseFloat(loc.lat));
    const lons = path.map(loc => parseFloat(loc.lon));
    const bounds = `lonlat:${Math.min(...lons)},${Math.min(...lats)},${Math.max(...lons)},${Math.max(...lats)}`;

    const markers = path.map((loc, i) =>
      `lonlat:${loc.lon},${loc.lat};type:material;color:%231f63e6;size:x-large;text:${i + 1};icon:cloud;icontype:awesome;whitecircle:no`
    ).join('|');

    const geoapifyUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&bounds=${bounds}&marker=${markers}&apiKey=${process.env.GEOAPIFY_API_KEY}`;

    // Fetch and send map image
    const response = await axios.get(geoapifyUrl, { responseType: 'stream' });
    res.setHeader('Content-Type', response.headers['content-type']);
    response.data.pipe(res);
  } catch (error) {
    console.error('Error fetching static map:', error);
    res.status(500).json({ error: 'Failed to fetch static map image' });
  }
};

// Export all functions
module.exports = {
  createPackage,
  addLocationToPackage,
  searchLocation,
  getPackages,
  getStaticMap,
};
