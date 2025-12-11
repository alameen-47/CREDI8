import express from 'express';
import {
  forgotPassword,
  getAllUsers,
  getUserData,
  login,
  register,
  updateProfileController,
  verifyOtp,
  // forgotPassword,
} from '../controllers/authController.js';

//router object
const router = express.Router();

//REGISTER
router.post('/register', register);

//LOGIN
router.post('/login', login);

//Forgot-Passwordsss
router.post('/send-otp', forgotPassword);

//Reset-Password
router.post('/reset-password', verifyOtp);

//Update user
router.post('/update-profile', updateProfileController);

// Route to get all users
router.get('/users', getAllUsers);

//get userData
router.get('/user/:id', getUserData);

export default router;
