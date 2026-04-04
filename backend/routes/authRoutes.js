import express from 'express';
import {
  forgotPassword,
  getAllUsers,
  getUserData,
  login,
  register,
  updateProfileController,
  verifyOtp,
} from '../controllers/authController.js';
import {authMiddleware} from '../middlewares/authMiddleware.js';
import {requireRole} from '../middlewares/requireRole.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', forgotPassword);
router.post('/reset-password', verifyOtp);
router.post('/update-profile', authMiddleware, updateProfileController);

router.get('/users', authMiddleware, requireRole('admin'), getAllUsers);
router.get('/user/:id', authMiddleware, getUserData);

export default router;
