import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

export const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({error: 'Unauthorized'});
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await userModel.findById(decoded.id).select('-password');
    // if (!user) {
    //   return res.status(401).json({error: 'User not found'});
    // }
    // console.log(
    //   'Middleware is verifying token with Secret:',
    //   process.env.JWT_SECRET,
    // );

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(401).json({error: 'Invalid Token'});
  }
};
