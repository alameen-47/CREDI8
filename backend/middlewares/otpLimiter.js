import rateLimit from 'express-rate-limit';

const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 5, // Limit each IP to 5 requests per `windowMs`
  message: { 
    success: false, 
    message: 'Too many OTP requests from this IP, please try again in 1 minute.' 
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export default otpLimiter;

