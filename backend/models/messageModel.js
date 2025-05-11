import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    message: {type: String},
    scheduledAt: {type: Date},
    sent: {type: Boolean, default: false}, // To track if the message has been sent or not
  },
  {timestamps: true},
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
