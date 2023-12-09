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
    if(html.split(' ')[0] === 'Đơn') {
      const info1 = await transporter.sendMail({
        from: '"ElectronicShop" <no-relply@electronicshop.com>', 
        to: email, 
        subject: "Đơn hàng của bạn tại Electronic Shop", 
        html: html, 
      });
      return info1;
    }
    else{
      const info2 = await transporter.sendMail({
        from: '"ElectronicShop" <no-relply@electronicshop.com>', 
        to: email, 
        subject: "Quên mật khẩu", 
        html: html, 
      });
      return info2;
    }
  }
  main();
}

module.exports = sendmail