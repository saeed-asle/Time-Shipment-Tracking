// models/Customer.js

const mongoose = require('mongoose'); // bring mongoose library

// This make address schema (for place info)
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true }, // street name (must give)
  number: { type: Number, required: true }, // housenumber (must give)
  city: { type: String, required: true },   // city name (must give)
  lat: Number, // latitude (can give or not)
  lon: Number  // longitude (can give or not)
});

// This make customer schema
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // customer name, must give, trim space
  email: { type: String, required: true, trim: true, unique: true }, // email, must give, no space, must be different
  address: { type: addressSchema, required: true } // customer address, must give, use addressSchema
});

// export this model with name 'Customer'
module.exports = mongoose.model('Customer', customerSchema);
