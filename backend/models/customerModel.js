import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    custName: {type: String, required: true, trim: true},
    custAmount: {type: Number, required: true, min: 0},
    custNumber: {
      type: String,
      required: true,
      validate: {
        validator: v => /^05\d{8}$/.test(String(v)),
        message: 'Invalid Saudi mobile number — must be 05xxxxxxxx (10 digits)',
      },
    },
    custDueDate: {type: Date, required: true},
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    paid: {type: Boolean, default: false, index: true},
  },
  {timestamps: true},
);

// Primary query pattern: all customers for a user, optionally filtered by paid
customerSchema.index({owner: 1, paid: 1, custDueDate: 1});

// Duplicate check: same customer name + number (scoped to owner)
customerSchema.index({owner: 1, custName: 1, custNumber: 1}, {unique: true});

export default mongoose.model('customers', customerSchema);
