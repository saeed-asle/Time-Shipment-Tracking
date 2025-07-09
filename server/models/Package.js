//models/Package.js

const mongoose = require('mongoose');
const locationSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lon: { type: Number, required: true }
});
const packageSchema = new mongoose.Schema({
  prod_id: { type: String, required: true },
  name: { type: String, required: true },
  start_date: { type: Date, required: true },
  eta: { type: Date, required: true },
  status: { type: String, enum: ['packed', 'shipped', 'intransit', 'delivered'], required: true },
  path: [locationSchema],
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true }
});
module.exports = mongoose.model('Package', packageSchema);
