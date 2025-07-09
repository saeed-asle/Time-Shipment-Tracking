//models/Customer.js

const mongoose = require('mongoose');
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  number: { type: Number, required: true },
  city: { type: String, required: true },
  lat: Number,
  lon: Number
});
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, unique: true },
  address: { type: addressSchema, required: true }
});
module.exports = mongoose.model('Customer', customerSchema);
