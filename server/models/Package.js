const mongoose = require('mongoose'); // bring mongoose library

// This make a schema for location (place)
const locationSchema = new mongoose.Schema({
  lat: { type: Number, required: true }, // latitude (must give)
  lon: { type: Number, required: true }  // longitude (must give)
});

// This make a schema for package
const packageSchema = new mongoose.Schema({
  prod_id: { type: String, required: true }, // product ID (must give)
  name: { type: String, required: true },    // product name (must give)
  start_date: { type: Number, required: true }, // date when it start (must give)
  eta: { type: Number, required: true },        // estimated time to arrive (must give)
  status: { 
    type: String, 
    enum: ['packed', 'shipped', 'intransit', 'delivered'], // only these status allowed
    required: true 
  },
  path: [locationSchema], // path is list of places (use location schema)
  buisness: { 
    type: mongoose.Schema.Types.ObjectId, // ID of business (from other collection)
    ref: 'buisnes', // link to 'buisnes' collection
    required: true 
  },
  customer: { 
    type: mongoose.Schema.Types.ObjectId, // ID of customer (from other collection)
    ref: 'Customer', // link to 'Customer' collection
    required: true 
  }
});

// export this model with name 'Package'
module.exports = mongoose.model('Package', packageSchema);
