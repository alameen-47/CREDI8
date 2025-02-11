import dotenv from 'dotenv';
dotenv.config(); // Load environment variables
import customerModel from '../models/customerModel.js';

export const SearchController = async (req, res) => {
  // Extract the 'query' parameter from the request's query string
  const {query} = req.query;
  console.log('Received query:', query);

  if (!query) {
    return res.status(400).json({message: 'Search query is required'});
  }

  try {
    console.log('Searching for customers in DB...');

    // Search for customers where the name or number matches the query (case-insensitive)
    const result = await customerModel.find({
      $or: [
        {custName: {$regex: query, $options: 'i'}},
        // {custNumber: {$regex: String(query)}},
      ],
    });
    console.log('Search results:', result); // Log DB response

    res.status(200).send(result);
  } catch (error) {
    console.error('Database Query Error:', error);
    res.status(500).json({
      message: 'Error Searching Customer',
      error,
    });
  }
};

export const AddCustomer = async (req, res) => {
  try {
    const {custName, custNumber, custAmount, custDueDate} = req.body;
    if (!custName || !custNumber || !custAmount || !custDueDate) {
      return res.status(400).json({message: 'Please fill in all fields.'});
    }
    const ExistingCustomer = await customerModel.findOne({
      custName,
      custNumber,
    });
    if (ExistingCustomer) {
      return res.status(400).send({message: 'Customer Already Exists'});
    }
    const customer = customerModel({
      custName,
      custNumber,
      custAmount,
      custDueDate,
    });
    await customer.save();
    res.status(201).json({
      success: true,
      message: 'Customer Added Successfully',
      customer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error in Adding Customer Details',
      error,
    });
  }
};

export const EditCustomer = async (req, res) => {
  try {
    const {custName, custNumber, custAmount, custDueDate} = req.body;
    const customer = await customerModel.findOne({
      _id: id, // Search by ID
      custName, // Match customer name
      custNumber, // Match customer number
    });
    if (!customer) {
      return res
        .status(404)
        .json({message: 'Customer not found with the given criteria'});
    }
    customer.custName = custName;
    customer.custAmount = custAmount;
    customer.custDueDate = custDueDate;
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error in Editing Customer Details',
      error,
    });
  }
};
