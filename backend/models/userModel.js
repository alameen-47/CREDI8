import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {type: String, required: true, trim: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    phone: {type: String, required: true},
    otp: {type: String},
    otpExpires: {type: Date},
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    plan: {
      type: String,
      default: 'free',
    },
    subscriptionStatus: {
      type: String,
      default: 'active',
    },
    razorpayCustomerId: {type: String},
    razorpaySubscriptionId: {type: String},
    /** MOCK_MODE pending tier before client confirms mock checkout */
    mockPendingPlanCode: {type: String},
    usagePeriodStart: {type: Date},
    usageCallMinutes: {type: Number, default: 0},
    usageCalls: {type: Number, default: 0},
    apiRequestsToday: {type: Number, default: 0},
    apiUsageDay: {type: String},
    oauthProvider: {type: String},
    oauthSubject: {type: String},
  },
  {timestamps: true},
);

export default mongoose.model('users', userSchema);
