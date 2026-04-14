import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import logger from '../utils/logger.js';

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
    logger.error('JWT_SECRET is not configured');
    return res
      .status(500)
      .json({success: false, message: 'Server misconfigured'});
  }

  try {
    const decoded = jwt.verify(token, secret);
    const userId = decoded.id || decoded._id;
    req.user = await userModel.findById(userId).select('-password').lean();

    if (!req.user) {
      return res
        .status(401)
        .json({success: false, message: 'Account not found'});
    }

    next();
  } catch (error) {
    // TokenExpiredError vs JsonWebTokenError — both are 401
    const msg =
      error.name === 'TokenExpiredError' ? 'Session expired' : 'Invalid token';
    logger.warn('Auth token rejected', {
      name: error.name,
      url: req.originalUrl,
    });
    res.status(401).json({success: false, message: msg});
  }
};
