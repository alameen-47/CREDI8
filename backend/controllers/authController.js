import transporter from '../config/nodemailer.js';
import {comparePassword, hashPassword} from '../helpers/authHelper.js';
import userModel from '../models/userModel.js';
import JWT from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import {normalizePlan} from '../config/plans.js';

dotenv.config(); // Load environment variables

function signUserToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return JWT.sign({id: String(userId)}, secret, {expiresIn: '7d'});
}

function publicUser(userDoc) {
  const u = userDoc.toObject ? userDoc.toObject() : {...userDoc};
  delete u.password;
  delete u.otp;
  delete u.razorpayCustomerId;
  delete u.razorpaySubscriptionId;
  delete u.mockPendingPlanCode;
  return u;
}

export const register = async (req, res) => {
  // console.log('Register function called');
  try {
    // Extract user data from the request body
    const {name, email, password, phone} = req.body;

    // Validation: Check if all required fields are provided
    if (!name || !email || !password || !phone) {
      return res.status(400).send({message: 'Please fill in all fields'}); // Return error if any field is missing
    }

    // Check if a user with the same email already exists in the database
    const ExistingUser = await userModel.findOne({email});

    // If the user already exists, return an error response
    if (ExistingUser) {
      return res.status(400).send({
        success: false,
        code: 'USER_EXISTS',
        message: 'Email already exists, Please login',
      });
    }

    // Hash the user's password for security
    const hashedPassword = await hashPassword(password);

    // Create a new user instance with the provided data and hashed password
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    // Save the new user to the database
    await user.save();

    res.status(201).send({
      success: true,
      code: 'USER_CREATED',
      message: 'User created successfully',
      userId: user._id,
      user: publicUser(user),
    });
  } catch (error) {
    // Log the error to the console for debugging
    console.error(error);

    // Send a server error response
    res.status(500).send({
      success: false,
      code: 'SERVER_ERROR',

      message: 'Error in Registration',
      error, // Include the error for more detailed debugging
    });
  }
};

//LOGIN
export const login = async (req, res) => {
  try {
    const {email, password} = req.body;

    //validation
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: 'Please fill in all fields',
      });
    }

    //check user
    const user = await userModel.findOne({email});

    //user not found
    if (!user) {
      return res.status(400).send({message: 'Invalid email or password'});
    }

    //compare password
    const isValidPassword = await comparePassword(password, user.password);

    //invalid password
    if (!isValidPassword) {
      return res.status(400).send({message: 'Invalid email or password'});
    }

    const token = signUserToken(user._id);
    res.status(200).send({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        plan: normalizePlan(user.plan),
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: 'Error in Login',
      error,
    });
  }
};

//forgotPasswordController
export const forgotPassword = async (req, res) => {
  try {
    const {email} = req.body;
    if (!email) {
      return res
        .status(400)
        .send({success: false, message: 'Email is Required'});
    }

    const user = await userModel.findOne({email});
    if (!user) {
      return res.status(404).send({
        success: false,
        message: 'User not found, please check your email.',
      });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Update user with OTP and expiration time
    user.otp = hashedOtp;
    user.otpExpires = Date.now() + 120000; // 2 minutes expiry
    await user.save();

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Your OTP for Password Reset of Your CREDI8 Account',
      text: `Your OTP for password reset of Your CREDI8 Account is ${otp}. It will expire in 2 minutes.`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res
          .status(500)
          .json({success: false, message: 'Error sending email'});
      }
      // console.log(info); // Log the information about the sent email

      return res
        .status(200)
        .json({success: true, message: 'OTP sent successfully'});
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Something went wrong333!',
      error,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const {email, otp, newPassword} = req.body;
    // Validate inputs
    if (!email || !otp || !newPassword) {
      return res.status(400).send({message: 'All fields are required'});
    }

    const user = await userModel.findOne({email});
    // Validate user existence
    if (!user) {
      return res.status(404).send({
        success: false,
        message: 'User not found, please check your email',
      });
    }

    // Validate OTP expiration
    if (Date.now() > user.otpExpires) {
      return res.status(400).send({message: 'OTP expired'});
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      return res.status(400).send({message: 'Invalid OTP'});
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).send({
      success: true,
      message: 'Password Changed Successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Something went wrong!',
      error,
    });
  }
};

export const updateProfileController = async (req, res) => {
  try {
    const {name, email, phoneNumber, phone} = req.body;
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    const nextName = typeof name === 'string' ? name.trim() : '';
    if (!nextName) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }
    user.name = nextName;

    const nextEmailRaw =
      typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (nextEmailRaw) {
      if (nextEmailRaw !== String(user.email || '').toLowerCase()) {
        const taken = await userModel.findOne({email: nextEmailRaw});
        if (taken) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use',
          });
        }
        user.email = nextEmailRaw;
      }
    }

    const nextPhone =
      phoneNumber != null && phoneNumber !== ''
        ? String(phoneNumber).trim()
        : phone != null && phone !== ''
          ? String(phone).trim()
          : null;
    if (nextPhone != null) {
      user.phone = nextPhone;
    }

    await user.save();
    res.status(200).json({
      success: true,
      message: 'Profile Updated Successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        plan: normalizePlan(user.plan),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
    });
  }
};

// Controller function to fetch all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select('-password');

    if (!users.length) {
      return res.status(404).send({
        success: false,
        message: 'No users found',
      });
    }
    const userData = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      plan: normalizePlan(user.plan),
    }));
    res.status(200).send({
      success: true,
      message: 'Users fetched successfully',
      users: userData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: 'Error fetching users',
      error,
    });
  }
};

// Controller function to fetch user data
export const getUserData = async (req, res) => {
  try {
    const userId = req.params.id;
    const requester = req.user;
    if (
      requester &&
      requester.role !== 'admin' &&
      String(requester._id) !== String(userId)
    ) {
      return res.status(403).send({
        success: false,
        message: 'Forbidden',
      });
    }
    const user = await userModel
      .findById(userId)
      .select(
        '-password -otp -razorpayCustomerId -razorpaySubscriptionId -mockPendingPlanCode',
      );

    if (!user) {
      return res.status(404).send({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).send({
      success: true,
      message: 'User data fetched successfully',
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: 'Error fetching user data',
      error,
    });
  }
};
