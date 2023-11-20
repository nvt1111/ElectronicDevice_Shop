const nodemailer = require('nodemailer');
require('dotenv').config();

const sendmail = async ({ email, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASSWORD,
    }
  });

  async function main() {
    const info = await transporter.sendMail({
      from: '"Cuahangdientu" <no-relply@cuahangdientu.com>', // sender address
      to: email, // list of receivers
      subject: "Forgot password", // Subject line
      html: html, // html body
    });
    console.log(info);
    return info;
  }
  main();
}

module.exports = sendmail