// models/Buisnes.js

const mongoose = require('mongoose'); // bring mongoose library

// This make schema for business info
const BuisnesSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,  // must give name
    trim: true       // remove extra space
  },
  site_url: { 
    type: String, 
    required: true,  // must give website link
    trim: true       // remove extra space
  }
});

// export this model with name 'buisnes'
module.exports = mongoose.model('buisnes', BuisnesSchema);
