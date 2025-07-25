import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    message: {type: String},
    scheduledAt: {type: Date},
    sent: {type: Boolean, default: false}, // To track if the message has been sent or not
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true},
  },
  {timestamps: true},
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
