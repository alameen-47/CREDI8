import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: {type: String, required: true},
  amount: {type: Number, required: true, minlength: 1},
  whatsappNumber: {type: String, required: true},
  dueDate: {type: Date, required: true},
});

module.exports = mongoose.model('Customer', customerSchema);
