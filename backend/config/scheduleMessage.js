import cron from 'node-cron';
import Message from '../models/messageModel';
import {sendBulkWhatsappMessages} from '../controllers/customerController';

export const scheduleMessage = message => {
  try {
    const scheduledAt = new Date(message.scheduledAt);

    cron.schedule('* * * * *', async () => {
      const currentDate = new Date();

      if (
        currentDate.toISOString() === scheduledAt.toISOString() &&
        !message.sent
      ) {
        await sendBulkWhatsappMessages(message);
        message.sent = true;
        await message.save();
      }
    });
  } catch (error) {}
};
