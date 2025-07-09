// views/company.js
const Company = require('../models/Company');

const createCompany = async (req, res) => {
  try {
    const company = new Company(req.body);
    await company.save();
    res.status(201).json({ message: 'Company created', id: company._id });
  } catch (err) {
    res.status(400).json({ error: err.errors || err.message });
  }
};

const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createCompany,
  getCompanies
};
