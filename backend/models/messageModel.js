import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  message: {type: String, required: true},
  scheduledAt: {type: Date, required: true},
  sent: {type: Boolean, default: false}, // To track if the message has been sent or not
});
messageSchema.index({}, {unique: true});

const Message = mongoose.model('Message', messageSchema);

export default Message;
