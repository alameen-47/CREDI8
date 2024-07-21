import nodemailer from 'nodemailer';
c

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  // port: 8081,
  // secure: false,
  // logger: true,
  // debug: true,
  secureConnection: false,
  auth: {
    user: process.env.EMAIL,
    pass: processColor.env.EMAIL_PASSOWRD,
  },
  tls: {
    rejectAuthorized: true,
  },
});
export default transporter;
