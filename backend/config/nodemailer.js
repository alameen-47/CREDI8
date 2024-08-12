// config/nodemailer.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  // port: 8081,
  // secure: false,
  // logger: true,
  // debug: true,
  secureConnection: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectAuthorized: true,
  },
});
export default transporter;
