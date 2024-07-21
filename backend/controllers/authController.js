const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email password
  },
});

exports.register = async (req, res) => {
  const {name, email, password} = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({email});
    if (user) {
      return res.status(400).json({error: 'User already exists'});
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 3600000; // OTP valid for 1 hour

    // Create new user with OTP and expiry
    user = new User({
      name,
      email,
      password,
      otp,
      otpExpires,
    });

    await user.save();

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Account Verification OTP',
      text: `Your OTP for account verification is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({message: 'OTP sent to your email'});
  } catch (error) {
    res.status(400).json({error: error.message});
  }
};

exports.verifyOtp = async (req, res) => {
  const {email, otp} = req.body;

  try {
    const user = await User.findOne({email, otp});
    if (!user) {
      return res.status(400).json({error: 'Invalid OTP'});
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({error: 'OTP expired'});
    }

    // Hash the password before saving
    user.password = await bcrypt.hash(user.password, 10);

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    const token = jwt.sign({userId: user._id}, process.env.C, {
      expiresIn: '1h',
    });

    res.json({token});
  } catch (error) {
    res.status(400).json({error: error.message});
  }
};

exports.login = async (req, res) => {
  const {email, password} = req.body;

  try {
    const user = await User.findOne({email});
    if (!user) {
      return res.status(400).json({error: 'Invalid credentials'});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({error: 'Invalid credentials'});
    }

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({token});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

exports.forgotPassword = async (req, res) => {
  const {email} = req.body;

  try {
    const user = await User.findOne({email});
    if (!user) {
      return res.status(400).json({error: 'User not found'});
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 3600000; // OTP valid for 1 hour

    // Update user with OTP and expiry
    user.otp = otp;
    user.otpExpires = otpExpires;

    await user.save();

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({message: 'OTP sent to your email'});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

exports.resetPassword = async (req, res) => {
  const {email, otp, newPassword} = req.body;

  try {
    const user = await User.findOne({email, otp});
    if (!user) {
      return res.status(400).json({error: 'Invalid OTP'});
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({error: 'OTP expired'});
    }

    // Hash the new password before saving
    user.password = await bcrypt.hash(newPassword, 10);

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).json({message: 'Password reset successful'});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};
