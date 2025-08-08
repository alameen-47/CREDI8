import dotenv from 'dotenv';
import twilio from 'twilio';
dotenv.config(); // Load environment variables
import customerModel from '../models/customerModel.js';
import Message from '../models/messageModel.js';
import {useReducer} from 'react';

export const SearchController = async (req, res) => {
  // Extract the 'query' parameter from the request's query string
  const {query, userId} = req.query;

  if (!query) {
    return res.status(400).json({message: 'Search query is required'});
  }

  try {
    // Search for customers where the name or number matches the query (case-insensitive)
    const result = await customerModel.find({
      owner: userId,
      $or: [
        {custName: {$regex: query, $options: 'i'}},
        // {custNumber: {$regex: String(query)}},
      ],
    });

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
    const {custName, custNumber, custAmount, custDueDate, userId} = req.body;
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
      owner: userId,
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
    const {_id, custAmount, custName, custDueDate, custNumber} = req.body;
    console.log(
      'RECIEVED DATA',
      _id,
      custAmount,
      custName,
      custDueDate,
      custNumber,
      '+++++++++++++',
    );
    if (!_id) {
      return res.status(404).send({
        success: false,
        message: 'No Customer Details Found in this criteria',
      });
    }

    const updateFields = {};

    if (custName !== undefined) updateFields.custName = custName;
    if (custAmount !== undefined) updateFields.custAmount = custAmount;
    if (custNumber !== undefined) updateFields.custNumber = custNumber;
    if (custDueDate !== undefined) updateFields.custDueDate = custDueDate;

    const updatedCustomer = await customerModel.findByIdAndUpdate(
      _id,
      {$set: updateFields},
      {new: true, runValidators: true},
    );

    if (!updatedCustomer) {
      return res.status(404).send({
        success: false,
        message: 'No Customer Fount in this ID',
      });
    }

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

export const FetchAllCustomer = async (req, res) => {
  try {
    const {userId, paid} = req.query;

    if (!userId) return res.status(400).json({message: 'User ID is required'});

    const filter = {owner: userId};

    if (paid === 'true') filter.paid = true;
    else if (paid === 'false') filter.paid = false;

    const customers = await customerModel.find(filter);
    res.status(200).send(customers);
  } catch (error) {
    console.log(Error);
    res.status(404).send({
      success: false,
      message: 'Error while fetching the All Customer Details',
    });
  }
};

export const DeleteCustomer = async (req, res) => {
  try {
    const {id} = req.params;
    const deletedCustomer = await customerModel.findByIdAndDelete(id);
    if (!deletedCustomer) {
      return res
        .status(404)
        .json({success: false, message: 'Customer not found'});
    }
    return res
      .status(200)
      .json({success: true, message: 'Customer Deleted Succesfully'});
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({success: false, message: 'Server Error', error: error.message});
  }
};

//WHATSAPP MESSAGE CONTROLLER
const client = twilio(process.env.TWILIO_SSID, process.env.TWILIO_AUTH_TOKEN);
export const sendBulkWhatsappMessages = async message => {
  const {messageBody} = message; // The message body to be sent

  try {
    const customers = await customerModel.find();

    if (!customers.length) {
      return res.status(400).json({
        success: false,
        message: 'No customers found',
      });
    }
    const messageBody =
      'Hello!  Mariyadhik PAisa Adachal ningalk nalladh, illengil sherikkum vivaram ariyum Ok?';

    const sendMessages = customers.map(async customer => {
      try {
        if (customer.custNumber) {
          return client.messages.create({
            from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
            to: `whatsapp:+966${customer.custNumber}`,
            body: messageBody,
          });
        }
      } catch (twilioError) {
        console.log(
          `Failed to send message to ${customer.custNumber}: `,
          twilioError,
        );
      }
    });

    await Promise.all(sendMessages);
    res.status(200).json({
      success: true,
      message: 'Message Sent To All Customers Successfully!!!',
    });
  } catch (error) {
    console.log('Error in sendBulkWhatsappMessages CONTROLLER', error);
    res.status(500).json({success: false, error: error.message});
  }
};
//Twilio calling feature controller and calling file
export const makeBulkCalls = async (req, res) => {
  try {
    const customers = await customerModel.find();
    if (!customers.length) {
      return res.status(400).json({
        success: false,
        message: 'No customers found',
      });
    }

    const sendCalls = customers.map(async customer => {
      try {
        const call = await client.calls.create({
          from: process.env.TWILIO_PHONE_NUMBER,
          to: `+966${customer.custNumber}`,
          url: `http://10.0.2.2:8086/api/v1/customer/twiml-voice`,
        });
        console.log(`CAll initiated to ${customer.custNumber}`);
      } catch (error) {
        console.error(`Failed to call ${customer.custNumber}: `, error.message);
      }
    });
    await Promise.all(sendCalls);
    res.status(200).json({
      success: true,
      message: 'Calls Initiated Succesfully!',
    });
  } catch (error) {
    console.log('Error in makeBulkCalls', error.message);
    res.status(500).json({success: false, error: error.message});
  }
};
//twilio voice file for calling
export const getTwiml = (req, res) => {
  const message =
    req.body.message ||
    'مرحباً، هذه تذكرة من مول رواد السليمي بخصوص المبلغ المتبقي على حسابكم. يرجى تسويته في أقرب وقت ممكن. شكراً لكم!';

  res.type('text/xml');
  res.send(`
    <Response>
    <Say voice="alice" language="ar-SA">${message}</Say>
    </Response>
    `);
};

export const createMessage = async (req, res) => {
  try {
    const {message, scheduledAt, userId} = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({success: false, message: 'User ID is required'});
    }

    // Fetch latest existing message if present
    const latest = await Message.findOne({owner: userId}).sort({createdAt: -1});

    const newMessage = message || (latest && latest.message);
    const newScheduledAt = scheduledAt || (latest && latest.scheduledAt);

    // If only one field is missing, fetch the most recent message to use its value
    if (!newMessage || !newScheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'Cannot use existing data because no messages exist yet',
      });
    }

    // Check if scheduledAt is a valid date
    const parsedDate = new Date(scheduledAt);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format for scheduledAt',
      });
    }
    // Create the new message
    const created = await Message.findOneAndUpdate(
      {owner: userId},
      {
        message,
        scheduledAt: parsedDate,
        sent: false,
        owner: userId,
      },
      {
        upsert: true, // Create one if none exists
        new: true, // Return updated document
      },
    );

    res.status(201).json({
      success: true,
      message: 'Message created and scheduled successfully',
      data: created,
    });
  } catch (error) {
    console.log('Error Creating Message: ', error);
    res.status(500).json({success: false, error: error.message});
  }
};

export const getMesssge = async (req, res) => {
  try {
    const userId = req.query.userId;
    const message = await Message.findOne({owner: userId}).sort({
      createdAt: -1,
    }); // Get latest message
    if (!message) {
      return res
        .status(404)
        .send({success: false, message: 'No messages found'});
    }
    res.status(200).send(message);
    console.log(`]]]]]]]]]]]]${message}[[[[[[[[[]]]]]]]]]`);
  } catch (error) {
    res.status(404).send({
      success: false,
      message: 'No messages found',
    });
  }
};
