import express from 'express';
import {
  forgotPassword,
  login,
  register,
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

export default router;
