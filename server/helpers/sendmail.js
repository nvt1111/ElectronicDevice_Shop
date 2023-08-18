const nodemailer = require('nodemailer');
require('dotenv').config();

const sendmail = async({email, html})=>{
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          // TODO: replace `user` and `pass` values from <https://forwardemail.net>
          user: process.env.EMAIL,
          pass: process.env.APP_PASSWORD,
        }
      });
      
      // async..await is not allowed in global scope, must use a wrapper
      async function main() {
        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: '"Cuahangdientu" <no-relply@cuahangdientu.com>', // sender address
            to: email, // list of receivers
            subject: "Forgot password", // Subject line
            html: html, // html body
        });
        return info;
}
}

module.exports = sendmail