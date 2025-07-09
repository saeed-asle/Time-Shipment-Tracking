//models/Buisnes.js
const mongoose = require('mongoose');
const BuisnesSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  site_url: { type: String, required: true, trim: true }
});
module.exports = mongoose.model('buisnes', BuisnesSchema);
