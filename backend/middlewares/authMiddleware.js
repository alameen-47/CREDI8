import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

export const authMiddleware = async (req, res, next) => {
  const header = req.header('Authorization') || '';
  const token = header.startsWith('Bearer ')
    ? header.slice(7)
    : header.split(' ')[1];
  if (!token) {
    return res.status(401).json({success: false, message: 'Unauthorized'});
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not set');
    return res.status(500).json({success: false, message: 'Server misconfigured'});
  }
  try {
    const decoded = jwt.verify(token, secret);
    const userId = decoded.id || decoded._id;
    req.user = await userModel.findById(userId).select('-password');
    // if (!user) {
    //   return res.status(401).json({error: 'User not found'});
    // }
    // console.log(
    //   'Middleware is verifying token with Secret:',
    //   process.env.JWT_SECRET,
    // );

    if (!req.user) {
      return res.status(401).json({success: false, message: 'User not found'});
    }
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(401).json({success: false, message: 'Invalid token'});
  }
};
