import mongoose from 'mongoose';

const callLogSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },
    customerId: {type: mongoose.Schema.Types.ObjectId, ref: 'customers'},
    toNumber: {type: String},
    twilioCallSid: {type: String},
    status: {
      type: String,
      enum: [
        'queued',
        'ringing',
        'in_progress',
        'completed',
        'failed',
        'busy',
        'no_answer',
        'canceled',
        'scheduled',
      ],
      default: 'queued',
    },
    scheduledFor: {type: Date},
    errorMessage: {type: String},
    durationSeconds: {type: Number, default: 0},
    retryCount: {type: Number, default: 0},
    lastAttemptAt: {type: Date},
  },
  {timestamps: true},
);

callLogSchema.index({owner: 1, createdAt: -1});
callLogSchema.index({owner: 1, status: 1, scheduledFor: 1});

export default mongoose.model('call_logs', callLogSchema);
