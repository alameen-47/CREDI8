import qrcode from 'qrcode-terminal';
import {Client} from 'whatsapp-web.js';
import nodeCron from 'node-cron';

const client = new Client();

client.on('qr', qr => {
  qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
  console.log('WhatsApp Web is ready!');
});

client.initialize();

exports.scheduleMessage = customer => {
  const dueDate = new Date(customer.dueDate);
  const cronTime = `${dueDate.getMinutes()} ${dueDate.getHours()} ${dueDate.getDate()} ${
    dueDate.getMonth() + 1
  } *`;

  nodeCron.schedule(cronTime, () => {
    client.sendMessage(
      customer.whatsappNumber,
      `Reminder: Your payment is due on ${dueDate.toDateString()}.`,
    );
  });
};
