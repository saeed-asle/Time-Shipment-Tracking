const Buisnes = require('../models/Buisnes'); // get the Buisnes model

// Function to create a new business
const createBuisnes = async (req, res) => {
  try {
    const buisnes = new Buisnes(req.body); // make new business from request body
    await buisnes.save(); // save to database
    res.status(201).json({ message: 'Company created', _id: buisnes._id }); // send success with ID
  } catch (err) {
    // if something wrong, send error
    res.status(400).json({ error: err.errors || err.message });
  }
};

// Function to get all businesses
const getBuisnes = async (req, res) => {
  try {
    const buisness = await Buisnes.find(); // find all businesses
    res.json(buisness); // send list to user
  } catch (err) {
    // if something wrong, send error
    res.status(500).json({ error: err.message });
  }
};

// export both functions to use in routes
module.exports = {
  createBuisnes,
  getBuisnes
};
