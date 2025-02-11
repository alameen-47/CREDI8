import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  custName: {type: String, required: true},
  custAmount: {type: Number, required: true, minlength: 1},
  custNumber: {type: Number, required: true, maxlength: 10},
  custDueDate: {type: Date, required: true},
});

export default mongoose.model('customers', customerSchema);
