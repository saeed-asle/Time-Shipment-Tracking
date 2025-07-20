const Customer = require('../models/Customer'); // get the Customer model
const axios = require('axios'); // bring axios to make HTTP requests
const LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY; // get the API key from .env file (used for maps if needed)

// Function to create a new customer
const createCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body); // create new customer with data from request
    await customer.save(); // save to database
    res.status(201).json({ message: 'Customer created', _id: customer._id }); // send success with new ID
  } catch (err) {
    // if something wrong, send error
    res.status(400).json({ error: err.errors || err.message });
  }
};

// Function to get all customers
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find(); // find all customers
    res.json(customers); // send list of customers
  } catch (err) {
    // if error, send server error
    res.status(500).json({ error: err.message });
  }
};

// export both functions to use in routes
module.exports = {
  createCustomer,
  getCustomers,
};
