const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    host: process.env.HOST,
    port: process.env.PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },

  });
  const mailOptions = {
    from: 'mrwriters@hotmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
