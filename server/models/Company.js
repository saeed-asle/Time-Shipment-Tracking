//models/Company.js
const mongoose = require('mongoose');
const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  website: { type: String, required: true, trim: true }
});
module.exports = mongoose.model('Company', companySchema);
