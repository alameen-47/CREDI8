// import Customer from '../models/Customer';
// import whatsappService from '../services/whatsappService';

// exports.addCustomer = async (req, res) => {
//   const {name, whatsappNumber, dueDate} = req.body;

//   try {
//     const customer = new Customer({name, whatsappNumber, dueDate});
//     await customer.save();
//     whatsappService.scheduleMessage(customer);
//     res.status(201).json(customer);
//   } catch (error) {
//     res.status(400).json({error: error.message});
//   }
// };

// exports.getCustomers = async (req, res) => {
//   try {
//     const customers = await Customer.find();
//     res.json(customers);
//   } catch (error) {
//     res.status(500).json({error: error.message});
//   }
// };
