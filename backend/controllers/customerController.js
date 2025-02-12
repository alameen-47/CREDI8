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
    // Ensure custDueDate is in the YYYY-MM-DD format before saving
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

// export const EditCustomer = async (req, res) => {
//   try {
//     const {_id, custName, custNumber, custAmount, custDueDate} = req.body;
//     const customer = await customerModel.findByIdAndUpdate(_id); // Search by ID

//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: 'Customer not found with the given criteria',
//       });
//     }
//     if (custName) customer.custName = custName;
//     if (custAmount) customer.custAmount = custAmount;
//     if (custDueDate) customer.custDueDate = custDueDate;
//     if (custNumber) customer.custNumber = custNumber;

//     //save the updated customer document
//     const updatedCustomer = await customer.save();
//     res.status(200).send({
//       success: true,
//       message: 'Customer Updated Successfully',
//       customer: updatedCustomer, // Return the updated customer
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: 'Error in Editing Customer Details',
//       error,
//     });
//   }
// };

export const EditCustomer = async (req, res) => {
  try {
    const {_id, custAmount, custName, custDueDate, custNumber} = req.body;

    if (!_id) {
      return res.status(404).send({
        success: false,
        message: 'No Customer Details Found in this criteria',
      });
    }
    const updatedCustomer = await customerModel.findByIdAndUpdate(
      _id,
      {
        custName,
        custAmount,
        custNumber,
        custDueDate,
      },
      {new: true, runValidators: true},
    );

    if (!updatedCustomer) {
      return res.status(404).send({
        success: false,
        message: 'No Customer Fount in this ID',
      });
    }

    // if (custName) customer.custName = custName;
    // if (custAmount) customer.custAmount = custAmount;
    // if (custNumber) customer.custNumber = custNumber;
    // if (custDueDate) customer.custDueDate = custDueDate;

    res.status(200).send({
      success: true,
      message: 'Customer Details Updated Succesfully',
      customer: updatedCustomer,
    });
  } catch (error) {
    console.log(error);
    res.status(404).send({
      success: false,
      message: 'Error While Updating Cusomer Details',
      error,
    });
  }
};
