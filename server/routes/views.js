const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { validatePackage,validatePackageUpdate } = require('../../utils/validator');
const LOCATIONIQ_API_KEY = 'pk.48c5c27b04afcdea04306cb5a825c7f9';
const FILE = path.join(__dirname, '../data/delivery.json');


const readFile = (callback, returnJson = false, filePath = FILE, encoding = 'utf8') => {
    fs.readFile(filePath, encoding, (err, data) => {
            if (err) {
                console.log(err);
            }
            if (!data) data="{}";
            callback(returnJson ? JSON.parse(data) : data);
       });
};

const writeFile = (fileData, callback, filePath = FILE, encoding = 'utf8') => {
        fs.writeFile(filePath, fileData, encoding, (err) => {
            if (err) {
                console.log(err);
            }
            callback();
        });
    };


module.exports = {
    create_package: async (req, res) => {
        const companyId = parseInt(req.params.companyid);
        const packageData = { ...req.body, companyId };

        const validation = await validatePackage(packageData);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        delete packageData.companyId;

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

        } 
        catch (err) {
            return res.status(500).json({ error: 'Address location conversion failed.' });
        }

        const newId = uuidv4();
        packageData.id = newId;

        readFile((data) => {
        if (!data[companyId]) {
            data[companyId] = [];
        }

        const finalData = {
            id: newId,
            ...packageData
        };

        data[companyId].push({ [newId]: finalData });

        writeFile(JSON.stringify(data, null, 2), () => {
            res.status(201).json({ message: 'Package created', id: newId });
            });
        }, true);
    },
    update_package: async (req, res) => {
        const packageId = req.params.packageid;
        const companyId = req.params.companyid;
        const updateFields = req.body;

        const validation = await validatePackageUpdate(updateFields);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        readFile((data) => {
            const companyPackages = data[companyId];
            if (!companyPackages) {
                return res.status(404).json({ error: 'Company not found' });
            }

            let found = false;
            for (let i = 0; i < companyPackages.length; i++) {
                const pkg = companyPackages[i];
                if (pkg[packageId]) {
                    if (updateFields.eta) {
                        pkg[packageId].eta = updateFields.eta;
                    }
                    if (updateFields.status) {
                        pkg[packageId].status = updateFields.status;
                    }
                    found = true;
                    break;
                }
            }

            if (!found) {
                return res.status(404).json({ error: 'Package not found' });
            }

            writeFile(JSON.stringify(data, null, 2), () => {
            res.status(200).json({ message: 'Package updated successfully' });
            });
        }, true);
    }
};

