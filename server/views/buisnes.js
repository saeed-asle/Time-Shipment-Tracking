// views/Buisnes.js
const Buisnes = require('../models/Buisnes');

const createBuisnes = async (req, res) => {
  try {
    const buisnes = new Buisnes(req.body);
    await buisnes.save();
    res.status(201).json({ message: 'Company created', _id: buisnes._id });
  } catch (err) {
    res.status(400).json({ error: err.errors || err.message });
  }
};

const getBuisnes = async (req, res) => {
  try {
    const buisness = await Buisnes.find();
    res.json(buisness);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createBuisnes,
  getBuisnes
};
