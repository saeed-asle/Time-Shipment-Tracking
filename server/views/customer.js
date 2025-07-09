// views/customer.js
const Customer = require('../models/Customer');
const axios = require('axios');
const LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY;

const createCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json({ message: 'Customer created', id: customer._id });
  } catch (err) {
    res.status(400).json({ error: err.errors || err.message });
  }
};

const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
};
