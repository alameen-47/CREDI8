import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {type: String, required: true, trim: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    phone: {type: String, required: true},
    otp: {type: String},
    otpExpires: {type: Date},

  },
  {timestamps: true},
);

export default mongoose.model('users', userSchema);
