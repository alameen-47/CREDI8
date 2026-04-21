import dotenv from 'dotenv';
dotenv.config();
import customerModel from '../models/customerModel.js';
import Message from '../models/messageModel.js';
import logger from '../utils/logger.js';

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeXmlText(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const SearchController = async (req, res) => {
  const {query} = req.query;
  const userId = req.user?._id?.toString() || req.query.userId;

  if (!query) {
    return res.status(400).json({message: 'Search query is required'});
  }
  if (!userId) {
    return res.status(400).json({message: 'User ID is required'});
  }

  try {
    const safe = escapeRegExp(query);
    const result = await customerModel.find({
      owner: userId,
      $or: [{custName: {$regex: safe, $options: 'i'}}],
    });

    res.status(200).send(result);
  } catch (error) {
    console.error('Database Query Error:', error);
    res.status(500).json({
      message: 'Error Searching Customer',
    });
  }
};

export const AddCustomer = async (req, res) => {
  const {custName, custNumber, custAmount, custDueDate, userId: bodyUserId} =
    req.body;
  const userId = req.user?._id?.toString() || bodyUserId;
  try {
    if (!custName || !custNumber || !custAmount || !custDueDate) {
      return res.status(400).json({success: false, message: 'Please fill in all fields.'});
    }
    if (!userId) {
      return res.status(400).json({success: false, message: 'User ID is required'});
    }
    const ExistingCustomer = await customerModel.findOne({
      owner: userId,
      custName,
      custNumber,
    });
    if (ExistingCustomer) {
      return res
        .status(409)
        .json({success: false, message: 'Customer already exists'});
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
    logger.error('AddCustomer failed', {err: error.message, userId});
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: Object.values(error.errors).map(e => e.message).join(', '),
      });
    }
    res.status(500).json({success: false, message: 'Error adding customer'});
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

    const existing = await customerModel.findById(_id);
    if (!existing) {
      return res.status(404).send({
        success: false,
        message: 'No Customer Found in this ID',
      });
    }
    if (
      req.user &&
      String(existing.owner) !== String(req.user._id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).send({success: false, message: 'Forbidden'});
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
    logger.error('EditCustomer failed', {err: error.message, id: req.body?._id});
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: Object.values(error.errors).map(e => e.message).join(', '),
      });
    }
    res.status(500).json({success: false, message: 'Error updating customer'});
  }
};

export const FetchAllCustomer = async (req, res) => {
  try {
    const {paid} = req.query;
    const userId = req.user?._id?.toString() || req.query.userId;

    if (!userId) return res.status(400).json({message: 'User ID is required'});

    // Pagination — page is 1-based; limit capped at 200
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(Math.max(1, Number(req.query.limit) || 50), 200);
    const skip = (page - 1) * limit;

    const filter = {owner: userId};
    if (paid === 'true') filter.paid = true;
    else if (paid === 'false') filter.paid = false;

    const [customers, total] = await Promise.all([
      customerModel
        .find(filter)
        .sort({custDueDate: 1})
        .skip(skip)
        .limit(limit)
        .lean(),
      customerModel.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('FetchAllCustomer failed', {err: error.message, userId: req.query.userId});
    res.status(500).json({success: false, message: 'Error fetching customers'});
  }
};

export const DeleteCustomer = async (req, res) => {
  try {
    const {id} = req.params;
    const existing = await customerModel.findById(id);
    if (
      existing &&
      req.user &&
      String(existing.owner) !== String(req.user._id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({success: false, message: 'Forbidden'});
    }
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

export const createMessage = async (req, res) => {
  try {
    const {message, scheduledAt, userId: bodyUserId} = req.body;
    const userId = req.user?._id?.toString() || bodyUserId;

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
    logger.error('createMessage failed', {err: error.message, userId: req.body?.userId});
    res.status(500).json({success: false, message: 'Error saving message'});
  }
};

export const getMesssge = async (req, res) => {
  try {
    const userId = req.user?._id?.toString() || req.query.userId;
    if (!userId) {
      return res
        .status(400)
        .send({success: false, message: 'User ID is required'});
    }
    const message = await Message.findOne({owner: userId}).sort({
      createdAt: -1,
    }); // Get latest message
    if (!message) {
      return res
        .status(404)
        .send({success: false, message: 'No messages found'});
    }
    res.status(200).send(message);
    // console.log(`]]]]]]]]]]]]${message}[[[[[[[[[]]]]]]]]]`);
  } catch (error) {
    res.status(404).send({
      success: false,
      message: 'No messages found',
    });
  }
};
