const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { nanoid } = require('nanoid');
const axios = require('axios');
require('dotenv').config();


const FILE = path.join(__dirname, '../data/delivery.json');
const LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY;
const YOUR_GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

const readFile = (callback, returnJson = false, filePath = FILE, encoding = 'utf8') => {
    fs.readFile(filePath, encoding, (err, data) => {
        if (err) console.log(err);
        if (!data) data = '{}';
        callback(returnJson ? JSON.parse(data) : data);
    });
};

const writeFile = (fileData, callback, filePath = FILE, encoding = 'utf8') => {
    fs.writeFile(filePath, fileData, encoding, (err) => {
        if (err) console.log(err);
        callback();
    });
};

module.exports = {
create_package: async (req, res) => {
  const companyId = parseInt(req.params.companyid);
  const packageData = {
    ...req.body,
    companyId
  };

  const fullAddress = `${packageData.customer.address.street} ${packageData.customer.address.number}, ${packageData.customer.address.city}`;

  try {
    const locRes = await axios.get('https://us1.locationiq.com/v1/search', {
      params: {
        key: LOCATIONIQ_API_KEY,
        q: fullAddress,
        format: 'json'
      }
    });

    const { lat, lon } = locRes.data[0];
    packageData.customer.address.lat = parseFloat(lat);
    packageData.customer.address.lon = parseFloat(lon);
    packageData.start_date = new Date(packageData.start_date).getTime();
    packageData.eta = new Date(packageData.eta).getTime();
  } catch (err) {
    return res.status(500).json({ error: 'Address location conversion failed.' });
  }

  const newId = nanoid(10);
  packageData.id = newId;

  // Move `path` to the end of the object
  let finalPackageData;
  if ('path' in packageData) {
    const { path, ...rest } = packageData;
    finalPackageData = { ...rest, path }; // preserves user-provided path
  } else {
    finalPackageData = { ...packageData, path: [] }; // adds default only if missing
  }

  readFile((data) => {
    if (!data[companyId]) data[companyId] = [];
    data[companyId].push({ [newId]: finalPackageData });

    data[companyId].sort((a, b) => {
      const pkgA = Object.values(a)[0];
      const pkgB = Object.values(b)[0];
      return pkgB.start_date - pkgA.start_date;
    });

    writeFile(JSON.stringify(data, null, 2), () => {
      res.status(201).json({ message: 'Package created', id: newId });
    });
  }, true);
}
,

  update_package: async (req, res) => {
    const { companyid, packageid } = req.params;
    const updateFields = req.body;

    readFile((data) => {
      const companyPackages = data[companyid];
      if (!companyPackages) return res.status(404).json({ error: 'Company not found' });

      const pkgObj = companyPackages.find(pkg => pkg[packageid]);
      if (!pkgObj) return res.status(404).json({ error: 'Package not found' });

      if (updateFields.eta) pkgObj[packageid].eta = updateFields.eta;
      if (updateFields.status) pkgObj[packageid].status = updateFields.status;

      writeFile(JSON.stringify(data, null, 2), () => {
        res.status(200).json({ message: 'Package updated successfully' });
      });
    }, true);
  },

getPackages: async (req, res) => {
  const { companyid } = req.params;
  readFile((data) => {
    const companyPackages = data[companyid] || [];

    const sortedPackages = companyPackages
      .map(pkgObj => {
        const key = Object.keys(pkgObj)[0];
        const pkg = pkgObj[key];
        return { key, pkg }; 
      })
      .sort((a, b) => b.pkg.start_date - a.pkg.start_date) 
      .map(({ key, pkg }) => {
        return {
          [key]: {
            ...pkg,
            start_date: new Date(pkg.start_date).toISOString(),
            eta: new Date(pkg.eta).toISOString()
          }
        };
      });

    res.status(200).json({ companyPackages: sortedPackages });
  }, true);
},


 getPackage: async (req, res) => {
  const { companyid, packageid } = req.params;
  readFile((data) => {
    const companyPackages = data[companyid];
    if (!companyPackages) return res.status(404).json({ error: 'Company not found' });

    const pkgObj = companyPackages.find(pkg => pkg[packageid]);
    if (!pkgObj) return res.status(404).json({ error: 'Package not found' });

    const pkg = pkgObj[packageid];

    pkg.start_date = new Date(pkg.start_date).toISOString();
    pkg.eta = new Date(pkg.eta).toISOString();

    res.status(200).json({ companyPackage: { [packageid]: pkg } });
  }, true);
},


AddLocationToPackage: async (req, res) => {
  const { companyid, packageid } = req.params;
  const { lat, lon } = req.body;
  try {
    const geoRes = await axios.get('https://us1.locationiq.com/v1/reverse.php', {
      params: {
        key: LOCATIONIQ_API_KEY,
        lat,
        lon,
        format: 'json',
        addressdetails: 1
      }
    });

    const countryCode = geoRes.data.address?.country_code;
    if (!countryCode || countryCode.toLowerCase() !== 'il') {
      return res.status(400).json({ error: 'Location must be within Israel' });
    }
  } catch (err) {
    console.error('Reverse geocoding failed:', err.message);
    return res.status(500).json({ error: 'Failed to verify location' });
  }

  readFile((data) => {
    const companyPackages = data[companyid];
    if (!companyPackages) return res.status(404).json({ error: 'Company not found' });

    const pkg = companyPackages.find(pkg => pkg[packageid]);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });

    if (!pkg[packageid].path) pkg[packageid].path = [];

    const alreadyExists = pkg[packageid].path.some(loc => loc.lat === lat && loc.lon === lon);
    if (alreadyExists) return res.status(400).json({ error: 'Location already exists in path' });

    pkg[packageid].path.push({ lat, lon });

    writeFile(JSON.stringify(data, null, 2), () => {
      res.status(200).json({ message: 'Location added successfully' });
    });
  }, true);
},



SearchLocationForPackage: async (req, res) => {
  const { location } = req.body;

  if (!location || typeof location !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing location string' });
  }

  try {
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

    if (countryCode.toLowerCase() !== 'il') {
      return res.status(400).json({ error: 'Location must be within Israel' });
    }

    return res.status(200).json({ lat, lon, address: result.display_name });

  } catch (err) {
    console.error('Search failed:', err.message);
    return res.status(500).json({ error: 'Geocoding failed' });
  }
},


getStaticMap: async (req, res) => {
  const { companyid, packageid } = req.params;

  readFile(async (data) => {
    const pkgData = data[companyid]?.find(pkg => pkg[packageid]);
    if (!pkgData) return res.status(404).json({ error: 'Package not found' });

    const path = pkgData[packageid].path;
    if (!path || path.length === 0) {
      return res.status(200).json({ message: 'No path data available' });
    }

    const lats = path.map(loc => parseFloat(loc.lat));
    const lons = path.map(loc => parseFloat(loc.lon));
    const bounds = `lonlat:${Math.min(...lons)},${Math.min(...lats)},${Math.max(...lons)},${Math.max(...lats)}`;

    const markers = path.map((loc, i) =>
      `lonlat:${loc.lon},${loc.lat};type:material;color:%231f63e6;size:x-large;text:${i + 1};icon:cloud;icontype:awesome;whitecircle:no`
    ).join('|');

    const geoapifyUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&bounds=${bounds}&marker=${markers}&apiKey=${process.env.GEOAPIFY_API_KEY}`;

    try {
      // Fetch the image from Geoapify as a stream
      const response = await axios.get(geoapifyUrl, { responseType: 'stream' });

      // Set the same content-type header to the response
      res.setHeader('Content-Type', response.headers['content-type']);

      // Pipe the image stream directly to the response
      response.data.pipe(res);
    } catch (error) {
      console.error('Error fetching static map:', error);
      res.status(500).json({ error: 'Failed to fetch static map image' });
    }
  }, true);}

};
