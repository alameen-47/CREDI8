import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: {success: false, code: 'RATE_LIMIT', message: 'Too many requests'},
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 30),
  standardHeaders: true,
  legacyHeaders: false,
  message: {success: false, code: 'RATE_LIMIT', message: 'Too many attempts'},
});
