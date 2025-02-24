import dotenv from 'dotenv';
import twilio from 'twilio';
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
    const customers = await customerModel.find();
    res.status(200).send(customers);
    console.log(`????????????????????? ${customers}????????????????????`);
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
export const sendBulkWhatsappMessages = async (req, res) => {
  console.log('Twilio SID:', process.env.TWILIO_SSID?.slice(0, 5), '...');
  console.log(
    'Twilio Auth:',
    process.env.TWILIO_AUTH_TOKEN?.slice(0, 5),
    '...',
  );

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
  res.type('text/xml');
  res.send(`
    <Response>
    <Say voice="alice" language="ar-SA">"مرحباً، هذه تذكرة من مول رواد السليمي بخصوص المبلغ المتبقي على حسابكم. يرجى تسويته في أقرب وقت ممكن. شكراً لكم!"
</Say>
    </Response>
    `);
};
