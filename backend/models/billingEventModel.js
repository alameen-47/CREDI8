import mongoose from 'mongoose';

const billingEventSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      index: true,
    },
    /** Razorpay event id or payment id for idempotency */
    providerEventId: {type: String, unique: true, sparse: true},
    provider: {type: String, default: 'razorpay'},
    type: {type: String, required: true},
    amountCents: {type: Number},
    currency: {type: String, default: 'INR'},
    status: {type: String},
    invoicePdf: {type: String},
    hostedInvoiceUrl: {type: String},
    periodStart: {type: Date},
    periodEnd: {type: Date},
    raw: {type: mongoose.Schema.Types.Mixed},
  },
  {timestamps: true},
);

export default mongoose.model('billing_events', billingEventSchema);
