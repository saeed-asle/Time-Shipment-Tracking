const fs = require('fs');
const path = require('path');
const { validatePackage } = require('../../utils/validator');

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
    create_pachage: (req, res) => {
        console.log("req.body",req.body);
        console.log("req.params",req.params);
        console.log("req.params.companyid",req.params.companyid);
        res.send("Package created");
    }
};