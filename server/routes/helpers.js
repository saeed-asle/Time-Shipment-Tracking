const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../data/delivery.json');

/**
 * readFile - Read JSON data from file and return parsed object or raw data.
 * @param {function} callback - Function to call with data after read.
 * @param {boolean} returnJson - If true, parse JSON before callback.
 * @param {string} filePath - File path to read from, default delivery.json.
 * @param {string} encoding - File encoding, default 'utf8'.
 * @returns {void}
 */
const readFile = (callback, returnJson = false, filePath = FILE, encoding = 'utf8') => {
  fs.readFile(filePath, encoding, (err, data) => {
    if (err) console.log(err);
    if (!data) data = '{}'; // if file empty, use empty json
    callback(returnJson ? JSON.parse(data) : data);
  });
};

/**
 * writeFile - Write string data to file.
 * @param {string} fileData - String data to write.
 * @param {function} callback - Function to call after write.
 * @param {string} filePath - File path to write to, default delivery.json.
 * @param {string} encoding - File encoding, default 'utf8'.
 * @returns {void}
 */
const writeFile = (fileData, callback, filePath = FILE, encoding = 'utf8') => {
  fs.writeFile(filePath, fileData, encoding, (err) => {
    if (err) console.log(err);
    callback();
  });
};

module.exports = {
  readFile,
  writeFile
};
